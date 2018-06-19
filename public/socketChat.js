 var socket = io();
var connectionLogMax = 50;
var chatLogMax = 50;

//phaser game initialization
/*var config = {
  type: Phaser.AUTO,
  parent: 'GAME',
  width: document.body.offsetWidth,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};

var game = new Phaser.Game(config);*/
var game = new Phaser.Game(document.body.offsetWidth, 600, Phaser.AUTO, 'GAME', { preload: preload, create: create, update: update });


$(function(){	//document ready

 

//

    $('#GAME').hide();
   $('#container').hide();
   $('#nickError').hide();


      



 });

    //input control between chat and game
    $('#m').on("focus", function(){
              game.input.enabled = false;
        });
      
      $('#m').on("blur", function(){
              game.input.enabled = true;
        });

         
   



  	$('#chat').submit(function(){

      if($('#m').val().trim()!=""){
    		socket.emit('chat message',$('#m').val());
      }

      $('#m').val('');

  		return false;

  	});


 
    $('#nickSubmit').submit(function(){

      $('#nickError').hide();


      var trimmed = $('#nickname').val().trim();

      var validated = /^[A-Z]+$/i.test(trimmed); //Check if trimmed nickname only contains letters

          
  
      if(validated){

        if(trimmed.length<10){

            socket.emit('nickname',$('#nickname').val());

                 socket.on('nameTaken', function(taken){

                      if(taken){
                          $('#nickError').text("The nickname is taken");
                          $('#nickError').show();
                      }
                      else{
                        $('#nickError').hide();
                        $('#nickSubmit').hide();
                        $('#container').show();
                        $('#GAME').show();
                      }
                  });

            }else{
                $('#nickError').text("Nickname must be shorter than 10 characters");
                $('#nickError').show();
            }    
  
      }
      else{
        $('#nickError').text("Nickname must only contain letters");
        $('#nickError').show();
      }

        

      $('#nickname').val('');
     return false;
    });
 


  

    //User chose nickname and connected
    /*socket.on('newNick', function(nick, onlineCount){

      $('#log').append($('<div>').text(nick + "  connected"));
       $('#onlineCount').text(onlineCount + "  online");
      chatUpdate('#log',connectionLogMax);
    });*/

    socket.on('newNick', function(players, player){

      $('#log').append($('<div>').text(player.playerName + "  connected"));
       $('#onlineCount').text(Object.keys(players).length + "  online");
      chatUpdate('#log',connectionLogMax);
    });



    //on user disconnect
    socket.on('disconnect', function(player,onlineCount){


      $('#log').append($('<div>').text(player.playerName + "  disconnected"));
       $('#onlineCount').text(onlineCount + "  online");
      chatUpdate('#log',connectionLogMax);




    });


  	socket.on('chat message', function(msg){
  	

  			$('#chatLog').append($('<div class ="chatmessages">').text(msg));


        chatUpdate('#chatLog',chatLogMax); //Entries in chat updated

  	});

  	
  



   //PHASER FUNCTIONS

     function preload() {

        game.load.image('ship', 'assets/paddle.png');
        game.load.image('bulletSprite', 'assets/ball5.png');
        game.load.image('cover', 'assets/paddleGreen.png');
     } 

   
    

  //var connectedPlayers;
  var firstConnection = false;
  var connectedSprites = {};
  var activeBullets = {};
  var bulletAllowance; //How far out of bounds a bullet can be before being destroyed
  var bulletSpeed;

  var upKey;
  var downKey;
  var rightKey;
  var leftKey;
  var respawnX;
  var respawnY;


  var fireRate;
  var nextFire;

  var cover;

    function create() {        

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.disableVisibilityChange = true;﻿
        game.input.enabled = false;

        cover = game.add.sprite(200,200, 'cover');

        bulletSpeed = 500;
        fireRate = 300; //higher = slower
        nextFire = 0;
        bulletAllowance = 20;

        respawnX = 20;
        respawnY = 20;

        upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);



  
    
       socket.on('newNick', function(players, newestPlayer){


          game.input.enabled = true;

          //if this is the first connection add all existing players.
        if(!firstConnection){

            for (var sock in players){    
                  if (players.hasOwnProperty(sock)){

                        connectedSprites[sock] = game.add.sprite(players[sock].x,players[sock].y, 'ship');
                        connectedSprites[sock].addChild(game.add.text(0-players[sock].playerName.length*3, -20, players[sock].playerName, { font: "15px Arial", fill: "#ffffff" }));


                        activeBullets[sock] = [];

                         
                        //$('#TEST').append($('<div>').text(test.width/2));
                     }
                 }
                firstConnection = true; 
            }
            else{

                connectedSprites[newestPlayer.id] = game.add.sprite(players[newestPlayer.id].x,players[newestPlayer.id].y, 'ship');
                connectedSprites[newestPlayer.id].addChild(game.add.text(0-players[newestPlayer.id].playerName.length*3, -20, players[newestPlayer.id].playerName, { font: "15px Arial", fill: "#ffffff" }));
                //$('#TEST').append($('<div>').text(players[newestPlayer.id].playerName.length/2));



                activeBullets[newestPlayer.id] = [];
            }



      });


       socket.on('disconnect', function(player,onlineCount){

          //$('#TEST').append($('<div>').text(player.id));
          //$('#TEST').append($('<div>').text(Object.keys(activeBullets[player.id]).length));

          //destroys player
          connectedSprites[player.id].destroy();
          delete connectedSprites[player.id];
          //destroys users bullets if they disconnect.
          for(var bullet in activeBullets[player.id]){
              activeBullets[player.id][bullet].destroy();
          }
          delete activeBullets[player.id];

      
             
               
      });


      socket.on('playerMoved', function(player){

          connectedSprites[player.id].x = player.x;
          connectedSprites[player.id].y = player.y;
      });
         

      socket.on('bulletFromServ',function(bullet){

          activeBullets[bullet.id][bullet.num] = game.add.sprite(connectedSprites[bullet.id].x - 8,connectedSprites[bullet.id].y - 8, 'bulletSprite');
          activeBullets[bullet.id][bullet.num].checkWorldBounds = true;
          activeBullets[bullet.id][bullet.num].outOfBoundsKill = true;

          game.physics.arcade.enable(activeBullets[bullet.id][bullet.num]);


          game.physics.arcade.moveToXY(activeBullets[bullet.id][bullet.num], bullet.xDest, bullet.yDest, bulletSpeed);

      });
    
      socket.on('collisionFromServ',function(playerHit, playerShooter, bulletID){
           connectedSprites[playerHit].x = respawnX;
           connectedSprites[playerHit].y = respawnY;

           activeBullets[playerShooter][bulletID].destroy();
          delete activeBullets[playerShooter][bulletID];
          //move playerHIT to respawn.
          //destroy and delete bullets.
          //can increment playerShooter score later.
      });
    




    }   


    var moved = false;

   

    function update() {

     

           //game.physics.arcade.collide(cover, connectedSprites[socket.id]);

  


     
      

          //Checking for any bullet collision against the client's player other than the client's own bullets.
          for(var id in activeBullets){
              for(var bullet in activeBullets[id]){
                  //also have another if statement here? If the bullet is out of bounds. Destroy the sprite and remove from the array?
                    if(BulletOutOfBounds(activeBullets[id][bullet])){
                            activeBullets[id][bullet].destroy();
                            delete activeBullets[id][bullet];
                            //$('#TEST').prepend($('<div>').text("BULLET DELETED"));
                      }
                      else{
                                    if(id!==socket.id){
                                        if(activeBullets[id][bullet].overlap(connectedSprites[socket.id])){

                                            socket.emit('collision', socket.id, id, bullet);

                                            activeBullets[id][bullet].destroy();
                                            delete activeBullets[id][bullet];
                                            //$('#TEST').append($('<div>').text(activeBullets[id][bullet]));
                                            //$('#TEST').append($('<div>').text("OVERLAPPING"));
                                              connectedSprites[socket.id].x = respawnX;
                                              connectedSprites[socket.id].y = respawnY;
                                            //Destroy player. Later reduce hp.
                                            //emit collision to server
  
                                               }     
                                      }
                      }
        
                 
                }


          }



         if (leftKey.isDown) {
            if(connectedSprites[socket.id].x>0){

                   connectedSprites[socket.id].x-=10;
                   moved = true;
            }

        }
        
        if (rightKey.isDown) {
          if(connectedSprites[socket.id].x<game.width-connectedSprites[socket.id].width){
                           connectedSprites[socket.id].x+=10;
                      moved = true;    
            }
        }
    
       if (upKey.isDown) {
                   if(connectedSprites[socket.id].y>0){
                           connectedSprites[socket.id].y-=10;
                           moved = true;
                    }
        }

         if (downKey.isDown) {
              if(connectedSprites[socket.id].y<game.height-connectedSprites[socket.id].height){
                           connectedSprites[socket.id].y+=10;
                           moved = true;
                }
        }
    

        if(game.input.activePointer.isDown){

            fireBullet();
             
        }
       
          if(moved){

            socket.emit('moved',connectedSprites[socket.id].x,connectedSprites[socket.id].y);
            moved = false;
          }

    }



  function fireBullet(){

      if(game.time.now > nextFire){
              


              nextFire = game.time.now + fireRate;


              activeBullets[socket.id].push(game.add.sprite(connectedSprites[socket.id].x - 8,connectedSprites[socket.id].y - 8, 'bulletSprite'));

              var latestIndex = activeBullets[socket.id].length-1;

              activeBullets[socket.id][latestIndex].checkWorldBounds = true;
              activeBullets[socket.id][latestIndex].outOfBoundsKill = true;

              game.physics.arcade.enable(activeBullets[socket.id][latestIndex]);

              game.physics.arcade.moveToXY(activeBullets[socket.id][latestIndex], game.input.mousePointer.x, game.input.mousePointer.y, bulletSpeed);

              socket.emit('bullet',
              {id:socket.id,
              x:activeBullets[socket.id][latestIndex].x,
              y:activeBullets[socket.id][latestIndex].y,
              xDest:game.input.mousePointer.x,
              yDest:game.input.mousePointer.y,
              num:latestIndex
              }); //think i need to emit object of single bullet here

              //$('#TEST').prepend($('<div>').text(activeBullets[socket.id].length));  

  



          }    
  }




   // game.update = function(){ }

    //CHAT UPDATE

    function chatUpdate(parent, maxEntries) {

    if($(parent + ' div').length>maxEntries){    //max 50 messages to be shown
            $(parent +  ' div').first().remove();
          }

        $(parent).scrollTop($(parent)[0].scrollHeight);
    }



//});




 function BulletOutOfBounds(bullet){

      if(bullet.x<0-bulletAllowance || bullet.x>game.width || bullet.y <0-bulletAllowance || bullet.y>game.height){


        //$('#TEST').prepend($('<div>').text("BULLET OUT OF BOUNDS")); 
        return true;
      }
      

      return false;
  }



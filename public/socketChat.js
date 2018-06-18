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
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'GAME', { preload: preload, create: create, update: update });


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

      var validated = /^[A-Z]+$/i.test($('#nickname').val().trim()); //Check if trimmed nickname only contains letters

          
  
      if(validated){

        
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

        this.load.image('ship', 'assets/paddle.png');

     } 

   
    

  //var connectedPlayers;
  var firstConnection = false;
  var connectedSprites = {};

 
   var upKey;
  var downKey;
  var rightKey;
  var leftKey;


    function create() {

        game.input.enabled = false;

              upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
              downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
              rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
              leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);




    
       socket.on('newNick', function(players, newestPlayer){


          game.input.enabled = true;

        if(!firstConnection){

            for (var sock in players){    
                  if (players.hasOwnProperty(sock)){

                        connectedSprites[sock] = game.add.sprite(players[sock].x,200, 'ship');


                     }
                 }
                firstConnection = true; 
            }
            else{

                connectedSprites[newestPlayer.id] = game.add.sprite(players[newestPlayer.id].x,200, 'ship');


            }




      });


       socket.on('disconnect', function(player,onlineCount){


          connectedSprites[player.id].destroy();
              
               
      });


   
    
  
    }   



   // game.create = function(){}

    function update() {

        
         if (leftKey.isDown) {
            if(connectedSprites[socket.id].x>0){
                   connectedSprites[socket.id].x-=10;
            }
        

        }
        
        if (rightKey.isDown) {
          if(connectedSprites[socket.id].x<game.width-connectedSprites[socket.id].width){
                           connectedSprites[socket.id].x+=10;
            }

        }
    
       if (upKey.isDown) {
                    if(connectedSprites[socket.id].y>0){
                           connectedSprites[socket.id].y-=10;
                    }

        }

         if (downKey.isDown) {
              if(connectedSprites[socket.id].y<game.height-connectedSprites[socket.id].height){
                           connectedSprites[socket.id].y+=10;
                }

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






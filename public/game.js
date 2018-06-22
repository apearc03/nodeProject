
var game = new Phaser.Game(1300, 600, Phaser.AUTO, 'GAME', { preload: preload, create: create, update: update });

  	
  



   //PHASER FUNCTIONS

     function preload() {

        game.load.image('ship', 'assets/tankNON.png');
        game.load.image('bulletSprite', 'assets/ball5.png');
        game.load.image('cover', 'assets/wallVertical.png');
        game.load.image('gun2', 'assets/turretNON.png');
        game.load.image('background', 'assets/grass.jpg');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('box', 'assets/box.png');
        game.load.image('largeWall', 'assets/largeWall.png');
        game.load.image('rock', 'assets/rock.png');
        //game.load.spritesheet('explosion', 'assets/exp.png', 1, 8,12,16);
        game.load.atlasJSONHash('explosion', 'assets/explosion.png', 'assets/explosion.json');
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

  var coverGroup; //use this for hit detection with bullets and player

  var explosion;

    function create(){        



        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.disableVisibilityChange = true;﻿
        game.input.enabled = false;

        game.scale.pageAlignHorizontally = true;
       	//game.scale.pageAlignVertically = true; //might not needas
       	//game.scale.refresh();
       	game.add.tileSprite(0,0,1300,600, 'background');


        coverGroup = game.add.group();

        coverGroup.physicsBodyType = Phaser.Physics.ARCADE;
        coverGroup.enableBody = true;


        coverGroup.add(game.add.sprite(400,250, 'wall'));
        coverGroup.add(game.add.sprite(400,400, 'cover'));
        coverGroup.add(game.add.sprite(200,500, 'box'));
        coverGroup.add(game.add.sprite(550,100, 'largeWall'));
        coverGroup.add(game.add.sprite(100,320, 'rock'));


        coverGroup.setAll('body.immovable', true);


        bulletSpeed = 500;
        fireRate = 300; //higher = slower
        nextFire = 0;
        bulletAllowance = 20;

        respawnX = 40;
        respawnY = 40;

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
                        connectedSprites[sock].addChild(game.add.text(0+players[sock].playerName.length/2, -30, players[sock].playerName, { font: "15px Arial", fill: "#ffffff" })); 
                        connectedSprites[sock].addChild(game.add.sprite(connectedSprites[sock].width/2,connectedSprites[sock].height/2, 'gun2'));
                        connectedSprites[sock].getChildAt(1).anchor.setTo(0.5, 0.5);
                        //
                        game.physics.arcade.enable(connectedSprites[sock]);
                        //connectedSprites[sock].body.enable = true;
                        //

                        activeBullets[sock] = [];
                         
                        //$('#TEST').append($('<div>').text(test.width/2));
                     }
                 }
                firstConnection = true; 
            }
            else{

                connectedSprites[newestPlayer.id] = game.add.sprite(players[newestPlayer.id].x,players[newestPlayer.id].y, 'ship');
                connectedSprites[newestPlayer.id].addChild(game.add.text(0+players[newestPlayer.id].playerName.length/2, -30, players[newestPlayer.id].playerName, { font: "15px Arial", fill: "#ffffff" }));
                connectedSprites[newestPlayer.id].addChild(game.add.sprite(connectedSprites[newestPlayer.id].width/2,connectedSprites[newestPlayer.id].height/2, 'gun2'));
                connectedSprites[newestPlayer.id].getChildAt(1).anchor.setTo(0.5, 0.5);
                //$('#TEST').append($('<div>').text(players[newestPlayer.id].playerName.length/2));
                //  
                game.physics.arcade.enable(connectedSprites[newestPlayer.id]);
                //connectedSprites[newestPlayer.id].body.enable = true;
                //
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

          activeBullets[bullet.id][bullet.num] = game.add.sprite(connectedSprites[bullet.id].x + connectedSprites[bullet.id].width/2,connectedSprites[bullet.id].y + connectedSprites[bullet.id].height/2, 'bulletSprite');
          //activeBullets[bullet.id][bullet.num] = game.add.sprite(connectedSprites[bullet.id].getChildAt(1).x,connectedSprites[bullet.id].getChildAt(1).y, 'bulletSprite');
          //activeBullets[bullet.id][bullet.num].checkWorldBounds = true;
          //activeBullets[bullet.id][bullet.num].outOfBoundsKill = true;
          activeBullets[bullet.id][bullet.num].moveDown();

          game.physics.arcade.enable(activeBullets[bullet.id][bullet.num]);

          //added for collision
          activeBullets[bullet.id][bullet.num].body.enable = true;

          //
          //connectedSprites[bullet.id].getChildAt(1).rotation = angleToXY(connectedSprites[bullet.id].getChildAt(1),bullet.xDest,bullet.yDest);
          //
          game.physics.arcade.moveToXY(activeBullets[bullet.id][bullet.num], bullet.xDest, bullet.yDest, bulletSpeed);

      });
    
      socket.on('collisionFromServ',function(playerHit, playerShooter, bulletID){

      		playExplosion(connectedSprites[playerHit].x, connectedSprites[playerHit].y);

           connectedSprites[playerHit].x = respawnX;
           connectedSprites[playerHit].y = respawnY;


           destroyBullet(playerShooter,bulletID);

           //activeBullets[playerShooter][bulletID].destroy();
          //delete activeBullets[playerShooter][bulletID];
          //move playerHIT to respawn.
          //destroy and delete bullets.
          //can increment playerShooter score later.
      });

   

      	socket.on('turretRotated',function(player, x,y){

      		connectedSprites[player].getChildAt(1).rotation = game.physics.arcade.angleToXY(connectedSprites[player], x, y);
      		//$('#TEST').prepend($('<div>').text(connectedSprites[player].getChildAt(1).rotation));
      	});

    
    }   


   var moved = false;
   var counter = 0;

   function update() {

   		

   

        if(firstConnection){
            connectedSprites[socket.id].body.velocity.x = 0;
            connectedSprites[socket.id].body.velocity.y = 0;


            //$('#TEST').prepend($('<div>').text(connectedSprites[socket.id].getChildAt(1).angle));
            //testing

            connectedSprites[socket.id].getChildAt(1).rotation = game.physics.arcade.angleToXY(connectedSprites[socket.id], game.input.mousePointer.x, game.input.mousePointer.y);


            if(game.input.activePointer.withinGame){
    			
 				socket.emit('turretRotation', socket.id, game.input.mousePointer.x, game.input.mousePointer.y);

            }

           


         
          game.physics.arcade.collide(coverGroup, connectedSprites[socket.id]);

           



     
      

          //Checking for any bullet collision against the client's player other than the client's own bullets.
          for(var id in activeBullets){
              for(var bullet in activeBullets[id]){

                      if(game.physics.arcade.collide(coverGroup, activeBullets[id][bullet])){ //Alter for when cover is part of a group
                        destroyBullet(id,bullet);
                      }
                      else if(BulletOutOfBounds(activeBullets[id][bullet])){
                            destroyBullet(id,bullet);
                            //$('#TEST').prepend($('<div>').text("BULLET DELETED"));
                      }
                      else{
                                    if(id!==socket.id){
                                        //if(activeBullets[id][bullet].overlap(connectedSprites[socket.id])){
                                        	if(game.physics.arcade.collide(activeBullets[id][bullet], connectedSprites[socket.id])){
                                        		destroyBullet(id,bullet);

                                            	socket.emit('collision', socket.id, id, bullet);

              									playExplosion(connectedSprites[socket.id].x, connectedSprites[socket.id].y);
                                            //activeBullets[id][bullet].destroy();
                                            //delete activeBullets[id][bullet];
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

                   connectedSprites[socket.id].body.velocity.x = -200;
                   moved = true;
            }

        }
        
        if (rightKey.isDown) {
          if(connectedSprites[socket.id].x<game.width-connectedSprites[socket.id].width){

                      connectedSprites[socket.id].body.velocity.x = 200;
                      moved = true; 

            }
        }
    

       if (upKey.isDown) {
                   if(connectedSprites[socket.id].y>0){
                          connectedSprites[socket.id].body.velocity.y = -200;
                          moved = true;

                    }
        }


         if (downKey.isDown) {
              if(connectedSprites[socket.id].y<game.height-connectedSprites[socket.id].height){

                            connectedSprites[socket.id].body.velocity.y = 200;
                            moved = true; 
                }
                //$('#TEST').prepend($('<div>').text(cover.getBounds()));
        }
    

        if(game.input.activePointer.isDown){

            fireBullet();
             
        }
       
          if(moved){

            socket.emit('moved',connectedSprites[socket.id].x,connectedSprites[socket.id].y);
            moved = false;
  

          }
   	}

 }



  function fireBullet(){

      if(game.time.now > nextFire){
              


              nextFire = game.time.now + fireRate;


              //activeBullets[socket.id].push(game.add.sprite(connectedSprites[socket.id].x - 4,connectedSprites[socket.id].y - 4, 'bulletSprite'));
              //Kinda works.
             // var gunAngle = connectedSprites[socket.id].getChildAt(1).angle + connectedSprites[socket.id].angle;
              //var p = new Phaser.Point(connectedSprites[socket.id].x, connectedSprites[socket.id].y); 
              //p2 = p.rotate(connectedSprites[socket.id].x, connectedSprites[socket.id].y, gunAngle, true, 25);
             // activeBullets[socket.id].push(game.add.sprite(p2.x,p2.y, 'bulletSprite'));

              
              //Workin method
              activeBullets[socket.id].push(game.add.sprite(connectedSprites[socket.id].x+connectedSprites[socket.id].width/2,connectedSprites[socket.id].y+connectedSprites[socket.id].height/2, 'bulletSprite'));


              var latestIndex = activeBullets[socket.id].length-1;

              //activeBullets[socket.id][latestIndex].checkWorldBounds = true;
              //activeBullets[socket.id][latestIndex].outOfBoundsKill = true;
              activeBullets[socket.id][latestIndex].moveDown();

              game.physics.arcade.enable(activeBullets[socket.id][latestIndex]);

              //activeBullets[socket.id][latestIndex].body.enable = true;

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


 function BulletOutOfBounds(bullet){

      if(bullet.x<0-bulletAllowance || bullet.x>game.width || bullet.y <0-bulletAllowance || bullet.y>game.height){


        //$('#TEST').prepend($('<div>').text("BULLET OUT OF BOUNDS")); 
        return true;
      }
      

      return false;
  }


function destroyBullet(playerID, bulletID){

    activeBullets[playerID][bulletID].destroy();
    delete activeBullets[playerID][bulletID];

}

function playExplosion(x,y){
		explosion = game.add.sprite(x,y, 'explosion', 'explosion0001.png');
      	explosion.animations.add('explode', Phaser.Animation.generateFrameNames('explosion', 1, 3,'.png', 4), 10, false, false);
        explosion﻿.animations.play('explode', 5, false, true);
}
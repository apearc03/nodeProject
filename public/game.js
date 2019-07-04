//PHASER framwork for game used here. Uses socket.io

//Setup a new Phaser.Game object. With dimensions 1300 x 600 pixels. Load into the 'GAME' div.
var game = new Phaser.Game(1300, 600, Phaser.AUTO, 'GAME', { preload: preload, create: create, update: update });

  	
  



   
      
     function preload() {
        //images and animations loaded in.
        game.load.image('ship', 'assets/tankNON.png');
        game.load.image('bulletSprite', 'assets/ball5.png');
        game.load.image('verticalWall', 'assets/wallVertical.png');
        game.load.image('gun2', 'assets/turretNON.png');
        game.load.image('background', 'assets/grass.jpg');
        game.load.image('horizontalWall', 'assets/wall.png');
        game.load.image('horizontalWallLarge', 'assets/largeWallHorizontal.png');
        game.load.image('box', 'assets/box.png');
        game.load.image('verticalWallLarge', 'assets/largeWall.png');
        game.load.image('rock', 'assets/rock.png');
        game.load.atlasJSONHash('explosion', 'assets/explosion.png', 'assets/explosion.json');

        //sounds loaded in.
        game.load.audio("shoot", ["assets/Shoot.ogg"]);
        game.load.audio("explode", ["assets/Explode.ogg"]);
     } 

   
    


  var firstConnection;
  //Keep track of the connectedSprites positions. so that the client can render them
  var connectedSprites = {};
  //Keep track of all the bullets, used to detect collision with the client's player
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

  //Sound
  var shootSound;
  var explodeSound;


    function create(){        


        firstConnection = false;

        //Receive a message when a new player joins the game.
      socket.on('newNick', function(players, newestPlayer){

        

          //if this client is the new player then add all sprites and existing players.
        if(!firstConnection){ 
              //Sound
              shootSound = game.add.audio("shoot");
              explodeSound = game.add.audio("explode");
              //Start the phaser physics engine
              game.physics.startSystem(Phaser.Physics.ARCADE);
              game.stage.disableVisibilityChange = true;﻿
              game.input.enabled = false;

              game.scale.pageAlignHorizontally = true;
              //Add the background image
              game.add.tileSprite(0,0,1300,600, 'background');


              //Make use of a phaser group for all the cover sprites and add them.
              coverGroup = game.add.group();
              coverGroup.physicsBodyType = Phaser.Physics.ARCADE;
              coverGroup.enableBody = true;

              coverGroup.add(game.add.sprite(400,250, 'verticalWallLarge'));
              coverGroup.add(game.add.sprite(500,75, 'verticalWallLarge'));
              coverGroup.add(game.add.sprite(1100,100, 'verticalWall'));
              coverGroup.add(game.add.sprite(600,500, 'verticalWall'));
              coverGroup.add(game.add.sprite(200,450, 'box'));
              coverGroup.add(game.add.sprite(700,125, 'box'));
              coverGroup.add(game.add.sprite(800,470, 'horizontalWall'));
              coverGroup.add(game.add.sprite(0,100, 'horizontalWallLarge'));
              coverGroup.add(game.add.sprite(1100,500, 'rock'));
              coverGroup.add(game.add.sprite(1200,400, 'rock'));
              coverGroup.add(game.add.sprite(950,200, 'rock'));

              //Set the cover to be immovable otherwise the physics and players will make them move.
              coverGroup.setAll('body.immovable', true);

              //Variables for player settings. These variables should probably be set on the server side.
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



          game.input.enabled = true;

            //Loop through all the players sent from the server and add a sprite in the correct position for each of them.
            for (var sock in players){    
                  if (players.hasOwnProperty(sock)){

                        connectedSprites[sock] = game.add.sprite(players[sock].x,players[sock].y, 'ship');
                        connectedSprites[sock].addChild(game.add.text(0+players[sock].playerName.length/2, -30, players[sock].playerName, { font: "15px Arial", fill: "#ffffff" })); 
                        connectedSprites[sock].addChild(game.add.sprite(connectedSprites[sock].width/2,connectedSprites[sock].height/2, 'gun2'));
                        connectedSprites[sock].getChildAt(1).anchor.setTo(0.5, 0.5);
                        //
                        game.physics.arcade.enable(connectedSprites[sock]);


                        activeBullets[sock] = [];
                         
                        
                     }
                 }
                firstConnection = true; 
            }
            else{
                //If the player has already connected and is in the game. Just add the new player to the game. 
                connectedSprites[newestPlayer.id] = game.add.sprite(players[newestPlayer.id].x,players[newestPlayer.id].y, 'ship');
                connectedSprites[newestPlayer.id].addChild(game.add.text(0+players[newestPlayer.id].playerName.length/2, -30, players[newestPlayer.id].playerName, { font: "15px Arial", fill: "#ffffff" }));
                connectedSprites[newestPlayer.id].addChild(game.add.sprite(connectedSprites[newestPlayer.id].width/2,connectedSprites[newestPlayer.id].height/2, 'gun2'));
                connectedSprites[newestPlayer.id].getChildAt(1).anchor.setTo(0.5, 0.5);
               
                game.physics.arcade.enable(connectedSprites[newestPlayer.id]);
    
                activeBullets[newestPlayer.id] = [];
            }



      });

        //Receive messages from the server about players disconnecting so that the clients can destroy the sprite and release resources.
       socket.on('playerDisconnect', function(player,onlineCount){

        

          //destroys player
          connectedSprites[player.id].destroy();
          delete connectedSprites[player.id];
          //destroys users bullets if they disconnect.
          for(var bullet in activeBullets[player.id]){
              activeBullets[player.id][bullet].destroy();
          }
          delete activeBullets[player.id];

      
             
               
      });

       //The client needs to receive data from the server whenever a client moves so that it can update the related sprite's position.
      socket.on('playerMoved', function(player){

          connectedSprites[player.id].x = player.x;
          connectedSprites[player.id].y = player.y;
      });
         
      //When a bullet is fired from a player, the server needs to send all clients
      socket.on('bulletFromServ',function(bullet){

          activeBullets[bullet.id][bullet.num] = game.add.sprite(connectedSprites[bullet.id].x + connectedSprites[bullet.id].width/2,connectedSprites[bullet.id].y + connectedSprites[bullet.id].height/2, 'bulletSprite');
          //activeBullets[bullet.id][bullet.num] = game.add.sprite(connectedSprites[bullet.id].getChildAt(1).x,connectedSprites[bullet.id].getChildAt(1).y, 'bulletSprite');
          //activeBullets[bullet.id][bullet.num].checkWorldBounds = true;
          //activeBullets[bullet.id][bullet.num].outOfBoundsKill = true;
          connectedSprites[bullet.id].bringToTop();
         // activeBullets[bullet.id][bullet.num].moveDown();


          game.physics.arcade.enable(activeBullets[bullet.id][bullet.num]);

          //added for collision
          activeBullets[bullet.id][bullet.num].body.enable = true;

          game.physics.arcade.moveToXY(activeBullets[bullet.id][bullet.num], bullet.xDest, bullet.yDest, bulletSpeed);

      });
    
      socket.on('collisionFromServ',function(playerHit, playerShooter, bulletID){

      		playExplosion(connectedSprites[playerHit].x, connectedSprites[playerHit].y);

           connectedSprites[playerHit].x = respawnX;
           connectedSprites[playerHit].y = respawnY;


           destroyBullet(playerShooter,bulletID);

    
      });

   

      	socket.on('turretRotated',function(player, x,y){
          //Rotate the turret of the specified player to the coordinates received from the server.
      		connectedSprites[player].getChildAt(1).rotation = game.physics.arcade.angleToXY(connectedSprites[player], x, y);
      		
      	});

    
    }   


   var moved = false;
   var counter = 0;

   function update() {

   		

   

        if(firstConnection){
            connectedSprites[socket.id].body.velocity.x = 0;
            connectedSprites[socket.id].body.velocity.y = 0;


            

            connectedSprites[socket.id].getChildAt(1).rotation = game.physics.arcade.angleToXY(connectedSprites[socket.id], game.input.mousePointer.x, game.input.mousePointer.y);


            if(game.input.activePointer.withinGame){
    			//Send the mouse coordinates to the server. So that they can be relayed to all other clients.
 				socket.emit('turretRotation', socket.id, game.input.mousePointer.x, game.input.mousePointer.y);

            }

           


         
          game.physics.arcade.collide(coverGroup, connectedSprites[socket.id]);

           



     
      

          //Checking for any bullet collision against the client's player other than the client's own bullets.
          for(var id in activeBullets){
              for(var bullet in activeBullets[id]){

                      //Bullet collides with terrain
                      if(game.physics.arcade.collide(coverGroup, activeBullets[id][bullet])){ //Alter for when cover is part of a group
                        destroyBullet(id,bullet);
                      }
                      //Bullet is out of bounds and is deleted to release resources and reduce the amount of bullets to keep track of
                      else if(BulletOutOfBounds(activeBullets[id][bullet])){
                            destroyBullet(id,bullet);  
                      }
                      else{

                                    //If the bullet ID is not equal to the players. (Every bullet but the player's)
                                    if(id!==socket.id){
                                      //Check if the bullet collides with the player.
                                        	if(game.physics.arcade.collide(activeBullets[id][bullet], connectedSprites[socket.id])){
                                        		destroyBullet(id,bullet);
                                              //Emit a collision message to the server.
                                            	socket.emit('collision', socket.id, id, bullet);

              									               playExplosion(connectedSprites[socket.id].x, connectedSprites[socket.id].y);
                                          
                                              	connectedSprites[socket.id].x = respawnX;
                                              	connectedSprites[socket.id].y = respawnY;
  
                                               }     
                                      }
                      }
        
                 
                }


          }

            
          

          //Constantly check for input in the update function. Move the player sprite accordingly
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
                
        }
    
        //If the left mouse button is down, call the fireBullet method.
        if(game.input.activePointer.isDown){

            fireBullet();
             
        }
          //Emit the players movements to the server.
          if(moved){
            socket.emit('moved',connectedSprites[socket.id].x,connectedSprites[socket.id].y);
            moved = false;
  

          }
   	}

 }


  //Called whenever the client fires a bullet.
  function fireBullet(){

      if(game.time.now > nextFire){
              

              shootSound.play('',0,0.1,false);
              nextFire = game.time.now + fireRate;

              //Working method
              activeBullets[socket.id].push(game.add.sprite(connectedSprites[socket.id].x+connectedSprites[socket.id].width/2,connectedSprites[socket.id].y+connectedSprites[socket.id].height/2, 'bulletSprite'));


              var latestIndex = activeBullets[socket.id].length-1;

              //activeBullets[socket.id][latestIndex].checkWorldBounds = true;
              //activeBullets[socket.id][latestIndex].outOfBoundsKill = true;
              connectedSprites[socket.id].bringToTop();
              //activeBullets[socket.id][latestIndex].moveDown();

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

             


          }    
  }


 function BulletOutOfBounds(bullet){

      if(bullet.x<0-bulletAllowance || bullet.x>game.width || bullet.y <0-bulletAllowance || bullet.y>game.height){

        return true;
      }
      

      return false;
  }


function destroyBullet(playerID, bulletID){

    activeBullets[playerID][bulletID].destroy();
    delete activeBullets[playerID][bulletID];

}
//Use phaser to play the explosion animations.
function playExplosion(x,y){
        //Add the explosion sprite to where the player has just been hit.
        explodeSound.play('',0,0.1,false);
		    explosion = game.add.sprite(x,y, 'explosion', 'explosion0001.png');
      	explosion.animations.add('explode', Phaser.Animation.generateFrameNames('explosion', 1, 3,'.png', 4), 10, false, false);
        explosion﻿.animations.play('explode', 10, false, true);
}
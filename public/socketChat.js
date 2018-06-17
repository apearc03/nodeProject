 var socket = io();
var connectionLogMax = 50;
var chatLogMax = 50;

//phaser game initialization
var config = {
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

var game = new Phaser.Game(config);



$(function(){	//document ready

 

//


   $('#container').hide();
   $('#nickError').hide();

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


    function create() {
      

      var self = this;
      //connectedPlayers = this.add.group();
    
       socket.on('newNick', function(players, newestPlayer){

        //var newPlayer = self.add.image(players[socket].x,200, 'ship'); //Need to only add the new ships to the group. Not the existing ones.
        //newPlayer.id = sock;
        //connectedPlayers.add(newPlayer);

        if(!firstConnection){

            for (var sock in players){    
                  if (players.hasOwnProperty(sock)){
                      /*var newPlayer = self.add.image(players[sock].x,200, 'ship'); //Need to only add the new ships to the group. Not the existing ones.
                        newPlayer.playerID = sock;
                        newPlayer.name = newestPlayer.playerName;
                        connectedPlayers.add(newPlayer);*/
                        connectedSprites[sock] = self.add.sprite(players[sock].x,200, 'ship');

                     }
                 }
                firstConnection = true; 
            }
            else{
              /*
                var newPlayer = self.add.image(players[newestPlayer.id].x,200, 'ship'); //Need to only add the new ships to the group. Not the existing ones.
                newPlayer.playerID = newestPlayer.id;
                newPlayer.name = newestPlayer.playerName;
                connectedPlayers.add(newPlayer);
                */
                connectedSprites[newestPlayer.id] = self.add.sprite(players[newestPlayer.id].x,200, 'ship');

            }




      });

       socket.on('disconnect', function(player,onlineCount){


          connectedSprites[player.id].destroy();
       
                 /*connectedPlayers.getChildren().forEach(function (otherPlayer) {
                    if (player.id === otherPlayer.playerID) {
                      //$('#TEST').append($('<div>').text(connectedPlayers.getByName(player.playerName).playerID));
                       $('#TEST').append($('<div>').text(connectedPlayers.getChildren().getByName(player.playerName)));
                      otherPlayer.destroy();

                    }
                  });  */   
              
               
      });



  
    }   



   // game.create = function(){}

    function update() {}

   // game.update = function(){ }

    //CHAT UPDATE

    function chatUpdate(parent, maxEntries) {

    if($(parent + ' div').length>maxEntries){    //max 50 messages to be shown
            $(parent +  ' div').first().remove();
          }

        $(parent).scrollTop($(parent)[0].scrollHeight);
    }



//});






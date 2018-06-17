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

    socket.on('newNick', function(player, playerCount){

      $('#log').append($('<div>').text(player.playerName + "  connected"));
       $('#onlineCount').text(playerCount + "  online");
      chatUpdate('#log',connectionLogMax);
    });



    //on user disconnect
    socket.on('disconnect', function(nick,onlineCount){


      $('#log').append($('<div>').text(nick + "  disconnected"));
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

   
    



   

    function create() {
      //addG();

      var self = this;

    
       socket.on('newNick', function(player, playerCount){

          self.add.image(200,200, 'ship');
          //this.game.ship = this.game.physics.add.image(x, x, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
     
      });

  
    }   


    function addG(){
       
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






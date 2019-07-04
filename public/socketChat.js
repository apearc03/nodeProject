//Script to create chat log, uses socket.io.

var socket = io();
var connectionLogMax = 50;
var chatLogMax = 50;

//Document is ready.
$(function(){	

 

    //Hide the game canvas and errors when the page first loads.Don't need to be shown until the player enters a nickname.
    $('#GAME').hide();
   $('#container').hide();
   $('#nickError').hide();


      



 });

    //Prevents input collisions between chat and game canvas
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

          
    //Various validation on nickname.
      if(validated){

        if(trimmed.length<10){

            socket.emit('nickname',$('#nickname').val());
                //Receives message back from server on whether the nickname is taken or not and reacts accordingly.
                 socket.on('nameTaken', function(taken){

                      if(taken){
                          //Show error message when the name is taken.
                          $('#nickError').text("The nickname is taken");
                          $('#nickError').show();
                      }
                      else{
                        //Hide the error and main div with the controls and title
                        $('#nickError').hide();
                        $('#main').hide();
                        //Show the game chat and game canvas.
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
 


  

  
    //When a client has chosen a valid nickname, the server sends a message out to all clients.
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

    //Receive a new chat message from the server.
  	socket.on('chat message', function(msg){
  	
        //Append it to the chat div
  			$('#chatLog').append($('<div class ="chatmessages">').text(msg));


        chatUpdate('#chatLog',chatLogMax); //Entries in chat updated

  	});

  	
  

    function chatUpdate(parent, maxEntries) {

    if($(parent + ' div').length>maxEntries){    //max 50 messages to be shown
            $(parent +  ' div').first().remove();
          }

        $(parent).scrollTop($(parent)[0].scrollHeight);
    }









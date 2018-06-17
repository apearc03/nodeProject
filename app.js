

var app = require('express')();
var express= require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);




app.use(express.static(__dirname + '/public'));



app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});


http.listen(3000, function(){
	console.log("App running on port 3000");
});



var players = {};
//var players = new Map(); 


io.on('connection', function(socket){

	console.log(socket.id + " user connected");

	socket.on('chat message', function(msg){

		
		//io.emit('chat message', players.get(socket.id).playerName  + ": " + msg);
		io.emit('chat message', players[socket.id].playerName  + ": " + msg);
		//io.emit('chat message', msg)
	});


	socket.on('disconnect', function(){

		//Frees up nickname from map only if it has been taken
		/*if(players.has(socket.id)){


			io.emit('disconnect', players.get(socket.id).playerName, players.size-1); //This will be change to players.get(socket.id).nickname
		    players.delete(socket.id);
		}*/

		if(socket.id in players){

				//io.emit('disconnect', players[socket.id].playerName, players.size-1); //This will be change to players.get(socket.id).nickname
				io.emit('disconnect', players[socket.id].playerName, Object.keys(players).length-1);
				
				delete players[socket.id];
		}

	 	
		console.log(socket.id + 'a user disconnected');

		
	});



	socket.on('nickname', function(nick){

		
		var taken = false;


		//Check if nick is taken with map
		/*for (var value of players.values()) {
		  if(value.playerName === nick){
		  		taken = true;
		  }
		}*/	

		for (var sock in players){
		    if (players.hasOwnProperty(sock)){
		      if(players[sock].playerName === nick){

		        	taken = true;
		        }
		    }
		      
		}



		if(!taken){
			//check if nickname is taken. Emit to the socket only not all sockets.
			//players.set(socket.id,nick); //Instead mapping socket.id to nickname. Map socket.id to a new player object that includes a nickname.
			//players.set(socket.id,{playerName:nick});
			players[socket.id] = {playerName:nick};

			//io.emit('newNick', nick, players.size); //emit which user connected.
			//io.emit('newNick', nick, Object.keys(players).length); 
			io.emit('newNick', players[socket.id], Object.keys(players).length);
			io.emit('test', players[socket.id], Object.keys(players).length); //added
		}


		socket.emit('nameTaken', taken); //Emit if the nickname was taken or not.


	});



});






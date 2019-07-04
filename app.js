
//SERVER FILE 

var app = require('express')();
var express= require('express');
var http = require('http').Server(app);
//Require socket.io for server/client communication
var io = require('socket.io')(http);

//Start the app on port 3000
var port= Number(3000);


app.use(express.static(__dirname + '/public'));

//When a client connects to the default directory, return public/index.html as the response.
app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});


http.listen(port, function(){
	console.log("App running at http://localhost:3000/");
});


//Object to keep track of the connected players
var players = {};
//Variable used for a socket.io group. Represents any players that are in game.
var game = 'game';

//When a client sends a 'connection' message, listen for further messages and game events.
io.on('connection', function(socket){

	//Print when a user connects for testing purposes
	console.log(socket.id + " user connected");


	socket.on('chat message', function(msg){

		io.in('game').emit('chat message', players[socket.id].playerName  + ": " + msg);	//Emit chat messages to users inside game including sender.

	});


	socket.on('disconnect', function(){

		//Frees up nickname from map only if it has been taken
		/*if(players.has(socket.id)){


			io.emit('disconnect', players.get(socket.id).playerName, players.size-1); //This will be change to players.get(socket.id).nickname
		    players.delete(socket.id);
		}*/

		if(socket.id in players){

				//io.emit('disconnect', players[socket.id].playerName, players.size-1); //This will be change to players.get(socket.id).nickname
				io.emit('disconnect', players[socket.id], Object.keys(players).length-1);
				socket.to('game').emit('playerDisconnect', players[socket.id], Object.keys(players).length-1);
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


		//If taken is false emit a message that a new player is joining the game.
		if(!taken){
			//check if nickname is taken. Emit to the socket only not all sockets.
			//players.set(socket.id,nick); //Instead mapping socket.id to nickname. Map socket.id to a new player object that includes a nickname.
		
			players[socket.id] = 
			{playerName:nick,
			id:socket.id,
			x:40,
			y:40
			};

			socket.join(game);
			//newNick is sent with the new player object who is about to join the game.
			io.in('game').emit('newNick', players, players[socket.id]);
		}

		//Take is either true or false.
		socket.emit('nameTaken', taken); //Emit if the nickname was taken or not.


	});

	//The server needs to receive a message from a client whenever the player is moved.
	socket.on('moved',function(x,y){

			
			players[socket.id].x = x;
			players[socket.id].y = y;
			//socket.broadcast.emit('playerMoved',players[socket.id]);
			socket.to('game').emit('playerMoved', players[socket.id]);
	});



	socket.on('bullet',function(bullet){

			//socket.broadcast.emit('bulletFromServ',bullet);
			socket.to('game').emit('bulletFromServ', bullet);
	})


	socket.on('collision', function(playerHit, playerShooter, bulletID){

			//socket.broadcast.emit('collisionFromServ',playerHit,playerShooter,bulletID);
			socket.to('game').emit('collisionFromServ',playerHit,playerShooter,bulletID);
			players[playerHit].x = 40;
			players[playerHit].y = 40;
			//change playerhit server location to 40,40
	})


	
	socket.on('turretRotation', function(player, x,y){
		

			//socket.broadcast.emit('turretRotated',player,x,y);
			socket.to('game').emit('turretRotated',player,x,y);
	})

});






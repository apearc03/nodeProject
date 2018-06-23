

var app = require('express')();
var express= require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);


var port= Number(process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));



app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});


http.listen(port, function(){
	console.log("App running on port 3000");
});



var players = {};
var game = 'game';
//var players = new Map(); 


io.on('connection', function(socket){

	console.log(socket.id + " user connected");

	socket.on('chat message', function(msg){

		
		//io.emit('chat message', players.get(socket.id).playerName  + ": " + msg);
		//io.emit('chat message', players[socket.id].playerName  + ": " + msg);
		io.in('game').emit('chat message', players[socket.id].playerName  + ": " + msg);	//Emit chat messages to users inside game including sender.

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
			//newNick client code called before the player is connected
			io.in('game').emit('newNick', players, players[socket.id]);
			//io.emit('newNick', players, players[socket.id]);
		}


		socket.emit('nameTaken', taken); //Emit if the nickname was taken or not.


	});


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






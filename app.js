

var app = require('express')();
//var app = express();
var express= require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);




app.use(express.static(__dirname + '/public'));



app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});


http.listen(8080, function(){
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
				io.emit('disconnect', players[socket.id], Object.keys(players).length-1);
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
			x:250,
			y:200
			};


			io.emit('newNick', players, players[socket.id]);
		}


		socket.emit('nameTaken', taken); //Emit if the nickname was taken or not.


	});


	socket.on('moved',function(x,y){

			
			players[socket.id].x = x;
			players[socket.id].y = y;
			socket.broadcast.emit('playerMoved',players[socket.id]);
	});



	socket.on('bullet',function(bullet){

			socket.broadcast.emit('bulletFromServ',bullet);
	})


	socket.on('collision', function(playerHit, playerShooter, bulletID){

			socket.broadcast.emit('collisionFromServ',playerHit,playerShooter,bulletID);
	})


	
	socket.on('turretRotation', function(player, x,y){
		

			socket.broadcast.emit('turretRotated',player,x,y);
	})

});






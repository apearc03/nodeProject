

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




var nickNames = new Map();


io.on('connection', function(socket){

	console.log(socket.id + " user connected");

	socket.on('chat message', function(msg){

		
		io.emit('chat message', nickNames.get(socket.id)  + ": " + msg);

		//io.emit('chat message', msg)
	});


	socket.on('disconnect', function(){

		//Frees up nickname from map only if it has been taken
		if(nickNames.has(socket.id)){


			io.emit('disconnect', nickNames.get(socket.id), nickNames.size-1);
		    nickNames.delete(socket.id);
		}
	 	
		console.log(socket.id + 'a user disconnected');

		
	});



	socket.on('nickname', function(nick){

		
		var taken = false;


		//Check if nick is taken
		for (var value of nickNames.values()) {
		  if(value === nick){
		  		taken = true;
		  }
		}	

		if(!taken){
			//check if nickname is taken. Emit to the socket only not all sockets.
			nickNames.set(socket.id,nick);
			io.emit('newNick', nick, nickNames.size); //emit which user connected.
		}

		socket.emit('nameTaken', taken); //Emit if the nickname was taken or not.


	});



});






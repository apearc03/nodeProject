/*var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World!');
}).listen(8080);*/



var app = require('express')()
var express= require('express')
var http = require('http').Server(app)
var io = require('socket.io')(http)


app.use(express.static(__dirname + '/public'));

//app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html')
})


http.listen(3000, function(){
	console.log("Example app on port 3000")
})




var nickNames = new Map();


io.on('connection', function(socket){

	console.log(socket.id + " user connected")

	socket.on('chat message', function(msg){

		
		io.emit('chat message', nickNames.get(socket.id)  + ": " + msg)

		//io.emit('chat message', msg)
	})

	socket.on('disconnect', function(){
		console.log(socket.id + 'a user disconnected')
	})



	socket.on('nickname', function(nick){

		/*nickNames.forEach(function(value, key) {
		  console.log(key + ' = ' + typeof value);
		});*/
		var taken = false;

		for (var value of nickNames.values()) {
		  if(value === nick){
		  		taken = true;
		  }
		}	

		if(taken){
			//check if nickname is taken
			console.log("Nickname taken");
		}else{
			//Add nick to map if it isnt
			nickNames.set(socket.id,nick);
		}


	})



})






var mongojs = require('mongojs');
var db = mongojs('localhost:27017/matsemon', ['player','monster']); //port, db and alle the collections we wanna use

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

/***************** game code **************************/

var isValidPassword = function(data,cb){     //CALLBACKS for database functionality...
	db.player.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0){
			cb(true);
		} else {
			cb(false);
		}
	});
}

var isUsernameTaken = function(data,cb){
	db.player.find({username:data.username},function(err,res){
		if(res.length > 0){
			cb(true);
		} else {
			cb(false);
		}
	});
}

var addUser = function(data,cb){
	db.player.insert({username:data.username,password:data.password},function(err){ //no need of res cause there is no return from the database!
		cb();
	});
}

var io = require('socket.io')(serv,{});


PLAYER_LIST = [];

io.sockets.on('connection', function(socket){ //a player connects
	//SIGNIN
	socket.on('signIn', function(data){
		isValidPassword(data,function(res){
			if(res){ //wird eingeloggt
				db.player.find({username:data.username},function(err,res){
					//res.length == 1
					var username = res[0].username;
					socket.id = username;
					res[0].socket = socket;
					PLAYER_LIST[username] = res[0];
					console.log(PLAYER_LIST);
				});
				socket.emit('signInResponse', {success:true});
			} else { // wird nicht eingeloggt
				socket.emit('signInResponse', {success:false});
			}	
		});
	});
	//DISCONNECT
	socket.on('disconnect',function(){
		delete PLAYER_LIST[socket.id];
	});
	//SIGNUP
	socket.on('signUp', function(data){
		isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse', {success:false});
			} else {
				addUser(data,function(){ //when all is done, say client that it was success (callback)
					socket.emit('signUpResponse', {success:true});
				});
			}		
		});
	});
	
	socket.on('sendMsgToServer', function(data){
		console.log(PLAYER_LIST);
		for(var player in PLAYER_LIST){
			PLAYER_LIST[player].socket.emit('addToChat', data);
		}
	});

});


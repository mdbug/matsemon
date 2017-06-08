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



var addUser = function(data,cb){
	db.player.insert({
		username:data.username,
		password:data.password,
		lvl:1,
		exp:0,
		atk1:'tackle',
		atk1Dmg: 7,
		atk1Cnt: 30,
		atk2:'fly',
		atk2Dmg: 2,
		atk2Cnt: 5,
		atk3:'run away',
		atk3Dmg: 5,
		atk3Cnt: 9,
		atk4:'shoot',
		atk4Dmg: 9,
		atk4Cnt: 2,
		guild:'none',
		infight: false,
		hp: 100,
	},
	function(err){ //no need of res cause there is no return from the database!
		cb();
	});
}

var DEBUG = true;
var io = require('socket.io')(serv,{});


FIGHT_LIST = [];
var fightId = 0;
PLAYER_LIST = [];
var numClients = 0;
io.sockets.on('connection', function(socket){ //a player connects and creates a socket to interact with
	
	numClients++;
	io.emit('stats',{numClients : numClients});
	console.log('Connected clients:', numClients);
	//SIGNIN
	socket.on('signIn', function(data){
		isValidPassword(data,function(res){
			if(res){ //wird eingeloggt
				db.player.find({username:data.username},function(err,res){
					//res.length == 1
					var username = res[0].username; //take username of logged in player from db
					socket.emit('getMyUsername', username);
					socket.id = username; //set id of socket from logged in player to his username
					res[0].socket = socket; //
					PLAYER_LIST[username] = res[0];
					console.log(PLAYER_LIST);
				});
				socket.emit('signInResponse', {success:true});
			} else { // wird nicht eingeloggt
				socket.emit('signInResponse', {success:false});
			}	
		});
	});
	//GIVEUP
	socket.on('giveUp', function(data){
		PLAYER_LIST[data.myname].infight = false;
		PLAYER_LIST[data.enemyname].infight = false;
		PLAYER_LIST[data.myname].socket.emit('endFight', {fightId: data.fightId});
		PLAYER_LIST[data.enemyname].socket.emit('endFight', {fightId: data.fightId});
		delete FIGHT_LIST[data.fightId];
	});
	
	
	//CHALLENGED 
	socket.on('challengeChoice', function(data){
		if(data.choice){//create fight
			FIGHT_LIST.push({
				challengerUsername: data.challangerUsername,
				opponentUsername: data.opponentUsername,
				challengerHp: 100,
				opponentHp: 100,
				turn: data.opponentUsername,
			});
			console.log(data.challengerUsername + '  ' + data.opponentUsername);
			//im kampf -> nicht mehr angreifbar
			PLAYER_LIST[data.challengerUsername].infight = FIGHT_LIST.length-1;
			PLAYER_LIST[data.opponentUsername].infight = FIGHT_LIST.length-1;
			
			PLAYER_LIST[data.challengerUsername].socket.emit('challengeAnswer', {opponentUsername:data.opponentUsername,success:true});
			socket.emit('beginFight', { //init data for challenger
				opponentUsername:data.opponentUsername, 
				challengerUsername:data.challengerUsername,
				id:fightId,
				yourlvl: PLAYER_LIST[data.challengerUsername].lvl,
				otherlvl: PLAYER_LIST[data.opponentUsername].lvl,
				yourguild: PLAYER_LIST[data.challengerUsername].guild,
				otherguild: PLAYER_LIST[data.opponentUsername].guild,
				begin: false,
			});
			PLAYER_LIST[data.opponentUsername].socket.emit('beginFight', { //init data for opponent
				opponentUsername:data.opponentUsername,
				challengerUsername:data.challengerUsername,
				id:fightId,
				yourlvl: PLAYER_LIST[data.opponentUsername].lvl,
				otherlvl: PLAYER_LIST[data.challengerUsername].lvl,
				yourguild: PLAYER_LIST[data.opponentUsername].guild,
				otherguild: PLAYER_LIST[data.challengerUsername].guild,
				begin: true,
			});
			fightId++;
		} else {
			PLAYER_LIST[data.challengerUsername].socket.emit('challengeAnswer', {opponentUsername:data.opponentUsername,success:false});
		}
	});
	//CHALLENGE
	socket.on('challenge', function(data){
		console.log(data);
		PLAYER_LIST[data.opponentUsername].socket.emit('challenged', {challengerUsername:data.challengerUsername});
	});
	
	//DEBUG
	socket.on('evalServer', function(data){
		if(DEBUG){
			var result = eval(data);
			socket.emit('evalAnswer', result);
		} else {
			socket.emit('evalAnswer', 'DEBUG MODE IS OFF!');	
		}
	});
	//DISCONNECT
	socket.on('disconnect',function(){
		delete PLAYER_LIST[socket.id];
			numClients--;
		io.emit('stats', {numClients: numClients});
		console.log('Connected clients:', numClients);
	});
	//SIGNUP
	socket.on('signUp', function(data){
		isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse', {success:false});
			} else {
				addUser(data,function(){ //when all is done, say client that it was success (callback)
					//user with default values was created
					socket.emit('signUpResponse', {success:true});
				});
			}		
		});
	});
	
	//chat
	socket.on('sendMsgToServer', function(data){
		console.log(PLAYER_LIST);
		for(var player in PLAYER_LIST){
			PLAYER_LIST[player].socket.emit('addToChat', data);
		}
	});
	
	//deal damage
	socket.on('dealDamage', function(data){
		var amountOfDmg = 10;
		PLAYER_LIST[data.enemy].socket.emit('takeDmg', {amount:amountOfDmg}); //attacked person will recognize
		socket.emit('yourEnemyTookDmg', {amount:amountOfDmg}); //attacking person will recognize
		if(FIGHT_LIST[data.fightId].opponentUsername === data.enemy){ //update in fight list
			FIGHT_LIST[data.fightId].opponentHp -= amountOfDmg;
		} else {
			FIGHT_LIST[data.fightId].challengerHp -= amountOfDmg;
		}
	});
	
	//atack authentification
	socket.on('atk1', function(){
		atk1Name = PLAYER_LIST[socket.id].atk1;
		atk1Dmg = PLAYER_LIST[socket.id].atk1Dmg;
		atk1Cnt = PLAYER_LIST[socket.id].atk1Cnt;
		if(PLAYER_LIST[socket.id].atk1Cnt > 0){
			socket.emit('atkResponse', {success:true, atkCnt: atk1Cnt, atkName:atk1Name,atkDmg:atk1Dmg});
		} else {
			socket.emit('atkResponse', {success:false, atkCnt: 0, atkName:atk1Name,atkDmg:atk1Dmg});
		}
	});
	socket.on('atk2', function(){
		atk2Name = PLAYER_LIST[socket.id].atk2;
		atk2Dmg = PLAYER_LIST[socket.id].atk2Dmg;
		atk2Cnt = PLAYER_LIST[socket.id].atk2Cnt;
		if(PLAYER_LIST[socket.id].atk1Cnt > 0){
			socket.emit('atkResponse', {success:true, atkCnt: atk2Cnt, atkName:atk2Name,atkDmg:atk2Dmg});
		} else {
			socket.emit('atkResponse', {success:false, atkCnt: 0, atkName:atk2Name,atkDmg:atk2Dmg});
		}
	});
});


var calculateDmg = function(){
	//TODO elements crit and stuff
}
//SIGNIN-, SIGNUP-functions
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



setInterval(function(){
	console.log('----- intervall -----');
	io.emit('clear');
	
	var key;
	for(key in PLAYER_LIST){
		player = {
			infight : PLAYER_LIST[key].infight,
			lvl : PLAYER_LIST[key].lvl,
			guild : PLAYER_LIST[key].guild,
			username : PLAYER_LIST[key].username,
		};
		io.emit('update', player); //JSON
		console.log(player);
	}
	

},2000);
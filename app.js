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
		PLAYER_LIST[data.myname].infight = undefined;
		PLAYER_LIST[data.enemyname].infight = undefined;
		PLAYER_LIST[data.myname].socket.emit('endFight', {fightId: data.fightId});
		PLAYER_LIST[data.enemyname].socket.emit('endFight', {fightId: data.fightId});
		delete FIGHT_LIST[data.fightId];
	});
	
	
	//CHALLENGED 
	socket.on('challengeChoice', function(data){
		if(data.choice){//create fight
			FIGHT_LIST.push({
				challengerUsername: data.challengerUsername,
				opponentUsername: data.opponentUsername,
				challengerHp: 100,
				opponentHp: 100,
				turn: data.opponentUsername,
			});
			fightId = FIGHT_LIST.length-1;
			console.log(data.challengerUsername + '  ' + data.opponentUsername);
			//im kampf -> nicht mehr angreifbar
			PLAYER_LIST[data.challengerUsername].infight = fightId;
			PLAYER_LIST[data.opponentUsername].infight = fightId;
			
			PLAYER_LIST[data.challengerUsername].socket.emit('challengeAnswer', {opponentUsername:data.opponentUsername,success:true});
			//herausforderer
			PLAYER_LIST[data.challengerUsername].socket.emit('beginFight', { //init data for challenger
				opponentUsername:data.opponentUsername, 
				challengerUsername:data.challengerUsername,
				id:fightId,
				mylvl: PLAYER_LIST[data.challengerUsername].lvl,
				otherlvl: PLAYER_LIST[data.opponentUsername].lvl,
				myguild: PLAYER_LIST[data.challengerUsername].guild,
				otherguild: PLAYER_LIST[data.opponentUsername].guild,
				turn: data.opponentUsername,
			});
			//herausgeforderter
			socket.emit('beginFight', { //init data for opponent
				opponentUsername:data.opponentUsername,
				challengerUsername:data.challengerUsername,
				id:fightId,
				mylvl: PLAYER_LIST[data.opponentUsername].lvl,
				otherlvl: PLAYER_LIST[data.challengerUsername].lvl,
				myguild: PLAYER_LIST[data.opponentUsername].guild,
				otherguild: PLAYER_LIST[data.challengerUsername].guild,
				turn: data.opponentUsername,
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
	

	
	//atack authentification
	socket.on('atk1', function(){
		atk1Dmg = PLAYER_LIST[socket.id].atk1Dmg;
		fightId = PLAYER_LIST[socket.id].infight;
		//ist er auch wirklich am zug???
		if(hisTurn(socket.id,fightId)){ //name und fightId
			
		}
		var newHp;
		var nameOfTheOther = '';
		console.log(fightId);
		console.log(FIGHT_LIST);
		if(FIGHT_LIST[fightId].opponentUsername === socket.id){ //opponent attacks
			nameOfTheOther = FIGHT_LIST[fightId].challengerUsername;
			FIGHT_LIST[fightId].challengerHp -= atk1Dmg;
			newHp = FIGHT_LIST[fightId].challengerHp;
		} else { //challenger attacks
			nameOfTheOther = FIGHT_LIST[fightId].opponentUsername;
			FIGHT_LIST[fightId].opponentHp -= atk1Dmg;
			newHp = FIGHT_LIST[fightId].opponentHp;
		}
		FIGHT_LIST[fightId].turn = nameOfTheOther;
		console.log(nameOfTheOther);
		
		PLAYER_LIST[nameOfTheOther].socket.emit('takeDmg', {newHp:newHp,turn:FIGHT_LIST[fightId].turn}); //attacked person will recognize
		socket.emit('yourEnemyTookDmg', {newHp:newHp,turn:FIGHT_LIST[fightId].turn}); //attacking person will recognize
		
		
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

var hisTurn = function(name,fightId){
	return name === FIGHT_LIST[fightId].turn;
}

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
	
	
	//TODO: spieler beim einloggen/aus dem kampf kommen hinzufügen, beim ausloggen/in den kampf gehen entfernen -> keine unnötigen datenpakete
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
	
	for(var fightId in FIGHT_LIST){
		PLAYER_LIST
	}
	

},2000);
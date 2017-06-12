var mongojs = require('mongojs');
var db = mongojs('localhost:27017/matsemon', ['player','monster']); //port, db and alle the collections we wanna use

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(8080);
console.log("Server started.");

/***************** game code **************************/



var addUser = function(data,cb){
	db.player.insert({
		username:data.username,
		password:data.password,
		lvl:1,
		exp:0,
		atk1:'tackle',
		atk1Dmg: 21,
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


var FIGHT_LIST = [];
var FIGHT_REQUEST_LIST = []; //Hier sollen alle Spieler rein, die herausgefordert wurden oder jemanden herausfordern - Niemand hieraus soll eine Anfrage stellen dürfen oder angefragt werden! Dies würde zu Problemen führen
var PLAYER_LIST = [];
var numClients = 0;
io.sockets.on('connection', function(socket){ //a player connects and creates a socket to interact with
	
	
	io.emit('stats',{numClients : numClients});
	console.log('Connected clients:', numClients);
	//SIGNIN
	socket.on('signIn', function(data){
		isValidPassword(data,function(res){
			if(res){ //wird eingeloggt
				
				if(PLAYER_LIST[data.username] != undefined){ //already logged in!
					socket.emit('alreadyLoggedIn', {});
				} else {
					numClients++;
					db.player.find({username:data.username},function(err,res){
						//res.length == 1
						var username = res[0].username; //take username of logged in player from db
						ready({username:username}); //shows up in opponent list of the otherguild
						for(var key in PLAYER_LIST){//needs to get entrys of all possible opponents at this time, //todo - all in one array, now: every single
							if(PLAYER_LIST[key].infight == false || PLAYER_LIST[key].infight >= 0){
								socket.emit('opponentInit', {username:key});
								console.log('im in opponentinit serverside');						
							}
						}
						
						socket.id = username; //set id of socket from logged in player to his username
						res[0].socket = socket; //
						PLAYER_LIST[username] = res[0];
						console.log(PLAYER_LIST);
						socket.emit('getMyUsername', {username:username,lvl:res[0].lvl});
					});
					socket.emit('signInResponse', {success:true});
					console.log('sign in response, success: true');
				}
			} else { // wird nicht eingeloggt
				socket.emit('signInResponse', {success:false});
				console.log('sign in response, success: false');
			}	
		});
	});
	
	//GIVEUP
	socket.on('giveUp', function(data){
		PLAYER_LIST[socket.id].infight = false;
		PLAYER_LIST[data.enemyUsername].infight = false;
		socket.emit('endFight', {fightId: data.fightId});
		PLAYER_LIST[data.enemyUsername].socket.emit('endFight', {fightId: data.fightId});
		setTimeout(function(){
			ready({username:socket.id});
			ready({username:data.enemyUsername});
			delete FIGHT_LIST[data.fightId];	
		},3000);
	});
	
	
	//CHALLENGED 
	socket.on('challengeChoice', function(data){
		if(data.choice){//create fight
			var challengerInFight = false;
			for(var key in FIGHT_LIST){
				if(FIGHT_LIST[key].opponentUsername == data.challengerUsername ||
				FIGHT_LIST[key].challengerUsername == data.challengerUsername){
					challengerInFight = true;
				}
			}
			if(challengerInFight){
				socket.emit('addToChat', {message: 'Der Herausforderer befindet sich mittlerweile bereits im Kampf!',color:'info'});
			} else {
				fightId = FIGHT_LIST.length;
				FIGHT_LIST.push({
					challengerUsername: data.challengerUsername,
					opponentUsername: socket.id,
					myGuild : PLAYER_LIST[socket.id].guild,
					enemyGuild : PLAYER_LIST[data.challengerUsername].guild,
					myLvl : PLAYER_LIST[socket.id].lvl,
					enemyLvl : PLAYER_LIST[data.challengerUsername].lvl,
					challengerHp: 100,
					opponentHp: 100,
					fightId : fightId,
					turn: socket.id,
				});
				
				console.log(data.challengerUsername + '  ' + socket.id);
				//im kampf -> nicht mehr angreifbar
				PLAYER_LIST[data.challengerUsername].infight = fightId; //infight ist Zahl
				PLAYER_LIST[socket.id].infight = fightId; //infight ist Zahl
				//damit auch nicht mehr für den client sichtbar! obiges ist nur zur serverseitigen absicherung
				busy({username:data.challengerUsername});
				busy({username:socket.id});
				
				console.log('dies ist das challenger lvl: '+PLAYER_LIST[data.challengerUsername].lvl+' ('+data.challengerUsername+')');
				console.log('dies ist das opponent lvl: '+PLAYER_LIST[socket.id].lvl+' ('+socket.id+')');
					
				PLAYER_LIST[data.challengerUsername].socket.emit('challengeAnswer', {opponentUsername:socket.id,success:true});
				//herausforderer bekommt FIGHT INIT
				PLAYER_LIST[data.challengerUsername].socket.emit('beginFight', { //init data for challenger
					myUsername : data.challengerUsername, 
					enemyUsername : socket.id,
					myGuild : PLAYER_LIST[data.challengerUsername].guild,
					enemyGuild : PLAYER_LIST[socket.id].guild,
					myLvl : PLAYER_LIST[data.challengerUsername].lvl,
					enemyLvl : PLAYER_LIST[socket.id].lvl,
					fightId : fightId,
					turn: socket.id, //Herausgeforderter fängt an!
				});
				//herausgeforderter bekommt FIGHT INIT
				socket.emit('beginFight', { //init data for opponent
					myUsername : socket.id, 
					enemyUsername : data.challengerUsername,
					myGuild : PLAYER_LIST[socket.id].guild,
					enemyGuild : PLAYER_LIST[data.challengerUsername].guild,
					myLvl : PLAYER_LIST[socket.id].lvl,
					enemyLvl : PLAYER_LIST[data.challengerUsername].lvl,
					fightId : fightId,
					turn: socket.id,
				});
				fightId++;
			}
		} else {
			PLAYER_LIST[data.challengerUsername].socket.emit('challengeAnswer', {opponentUsername:socket.id,success:false});
		}
	});
	//CHALLENGE
	socket.on('challenge', function(data){
		console.log('challenge question went to server: '+data);
		PLAYER_LIST[data.opponentUsername].socket.emit('challenged', {challengerUsername:socket.id});
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
		busy({username:socket.id});
		numClients--;
		io.emit('stats', {numClients: numClients});
		console.log('Connected clients:', numClients);
		try{
			db.player.update({"username":socket.id}, {$set: {"lvl":PLAYER_LIST[socket.id].lvl}}); //lvl in db speichern? :o
			delete PLAYER_LIST[socket.id];
		} catch(err){
			
		}
		
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
			PLAYER_LIST[player].socket.emit('addToChat', {message:socket.id+': '+data});
		}
	});
	//whisp
	socket.on('sendWspToServer', function(data){
		if(PLAYER_LIST[data.to] != undefined){
			if(data.to == socket.id){
				socket.emit('whisperFail', {stupid:true});
			} else {
				socket.emit('whisperFromMe', {message:"flüstern an "+data.to+": "+data.message});
				PLAYER_LIST[data.to].socket.emit('whisperForMe', {message:socket.id+": "+data.message});
			}
		} else {
			socket.emit('whisperFail', {to:data.to});
		}
	});
	//atack authentification
	socket.on('atk1', function(){
		if(PLAYER_LIST[socket.id] != undefined){ //spieler muss on sein zum angreifen
			atk1Dmg = PLAYER_LIST[socket.id].atk1Dmg;
			console.log('atk1Dmg ist so hoch: '+atk1Dmg);
			fightId = PLAYER_LIST[socket.id].infight;
			//ist er auch wirklich am zug???
			if(hisTurn(socket.id,fightId)){ //name und fightId
				var newHp;
				var nameOfTheOther = '';
				console.log(fightId);
				console.log(FIGHT_LIST);
				if(FIGHT_LIST[fightId].opponentUsername === socket.id){ //opponent - thats me: opponent attacks
					nameOfTheOther = FIGHT_LIST[fightId].challengerUsername;
					FIGHT_LIST[fightId].challengerHp -= atk1Dmg;
					newHp = FIGHT_LIST[fightId].challengerHp;
				} else { //challenger attacks
					nameOfTheOther = FIGHT_LIST[fightId].opponentUsername;
					FIGHT_LIST[fightId].opponentHp -= atk1Dmg;
					newHp = FIGHT_LIST[fightId].opponentHp;
				}
				FIGHT_LIST[fightId].turn = nameOfTheOther;

				console.log('die neuen HP für '+nameOfTheOther+' beträgt '+newHp);
				
				PLAYER_LIST[nameOfTheOther].socket.emit('takeDmg', {newHp:newHp,turn:FIGHT_LIST[fightId].turn}); //attacked person will recognize
				socket.emit('yourEnemyTookDmg', {newHp:newHp,turn:FIGHT_LIST[fightId].turn}); //attacking person will recognize
				
				
				if(newHp <= 0){
					socket.emit('endFight', {fightId:fightId});
					PLAYER_LIST[nameOfTheOther].socket.emit('endFight', {fightId:fightId});
					//Belohnungen verteilens
					PLAYER_LIST[socket.id].lvl += 5;
					PLAYER_LIST[nameOfTheOther].lvl += 1;
					socket.emit('addToChat', {message:socket.id+' hat gesiegt!',color:'info'});
					PLAYER_LIST[nameOfTheOther].socket.emit('addToChat', {message:socket.id+' hat gesiegt!',color:'info'});
					setTimeout(function(){
						ready({username:socket.id});
						ready({username:nameOfTheOther});
						delete FIGHT_LIST[fightId];	
					},3000);
				}
			}
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

//show everybody he came on / out of fight
function ready(data){
	for(var key in PLAYER_LIST){
		if(PLAYER_LIST[key].username !== data.username){
			PLAYER_LIST[key].socket.emit('ready', data);
		}
	}
}

//show everybody he went off / went into fight
function busy(data){
	for(var key in PLAYER_LIST){
		if(PLAYER_LIST[key].username !== data.username){
			PLAYER_LIST[key].socket.emit('busy', data);
		}
	}
}
	

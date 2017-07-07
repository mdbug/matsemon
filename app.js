var mongojs = require('mongojs');
var db = mongojs('localhost:27017/matsemon', ['player','monster']); //port, db and alle the collections we wanna use
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
var port = 8080;
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(port);
console.log("Server started on port "+port+".");
var gameScripts = require('./client/scripts/elo.js');
var DEBUG = true; //should be on false when in live version
var numClients = 0;
var FIGHT_LIST = [];
var FIGHT_REQUEST_LIST = []; //Hier sollen alle Spieler rein, die herausgefordert wurden oder jemanden herausfordern - Niemand hieraus soll eine Anfrage stellen dürfen oder angefragt werden! Dies würde zu Problemen führen
var PLAYER_LIST = [];
var READY_LIST = [];
var ATTACKS = {
	//mystic attacks
	'Death Grip':{type:'mystic',strong:'science',dmg:{dmgFrom: 15, dmgTo: 23},hit:0.7,crit:0,selfdmg:0}, //lvl 1
	'Doom':{type:'mystic',strong:'',dmg:15,hit:1,crit:0.3,selfdmg:4}, //lvl 1
	'Soul Harvest':{type:'mystic',strong:'holy',dmg:10,hit:0.8,crit:0.3,selfdmg:-4}, //lvl 5
	'Ghoul Explosion':{type:'mystic',strong:'science',dmg:24,hit:0.8,crit:0.3,selfdmg:9}, //lvl 10
	'Summon Satan':{type:'mystic',strong:'science',dmg:{dmgFrom:0,dmgTo:66},hit:0.2,crit:0.6,selfdmg:-5}, //lvl 20
	'Darkness':{type:'mystic',strong:'science',dmg:{dmgFrom:0,dmgTo:99},hit:0.33,crit:0,selfdmg:3}, //lvl 15
	
	//holy attacks
	'Holy Pain':{type:'holy',strong:'mystic',dmg:14,hit:0.8,crit:0.3,selfdmg:-1}, //lvl 1
	'Jesus Punch':{type:'holy',strong:'',dmg:12,hit:1,crit:0.5,selfdmg:2}, //lvl 1
	'Exorcism':{type:'holy',strong:'mystic',dmg:{dmgFrom:-10,dmgTo:40},hit:0.9,crit:0.5,selfdmg:3}, //lvl 10
	'Heal':{type:'holy',strong:'science',dmg:0,hit:1,crit:0,selfdmg:{dmgFrom: -20, dmgTo: -7}}, //lvl 5
	'Rape':{type:'holy',strong:'mystic',dmg:14,hit:0.7,crit:0.2,selfdmg:-3}, //lvl 20
	'Throw Bible':{type:'holy',strong:'mystic',dmg:21,hit:0.5,crit:0.2,selfdmg:-2}, //lvl 15
	
	//science attacks
	'Zero-Division':{type:'science',strong:'',dmg:100,hit:0.25,crit:0,selfdmg:42}, //lvl 1
	'Analysis 2':{type:'science',strong:'holy',dmg:13,hit:0.8,crit:0.5,selfdmg:0}, //lvl 10
	'Epsilon-Delta-Crit':{type:'science',strong:'holy',dmg:20,hit:0.6,crit:1,selfdmg:5}, //lvl 15
	'Gauß':{type:'science',strong:'mystic',dmg:5,hit:0.9,crit:0.2,selfdmg:-9}, //lvl 1
	'Sumzing sumzing':{type:'science',strong:'holy',dmg:11,hit:0.9,crit:0.7,selfdmg:0},//lvl 5
	'Horners Method':{type:'science',strong:'mystic',dmg:26,hit:0.6,crit:0.5,selfdmg:8}, //lvl 20
	
	//GM-Attacks
	'OnePunch':{type:'mystic',strong:'science',dmg:1337,hit:1,crit:1,selfdmg:-1337},
	'GodMode':{type:'holy',strong:'mystic',dmg:0,hit:1,crit:0,selfdmg:-200000000},
	'Aimbot':{type:'science',strong:'holy',dmg:1000,hit:1000,crit:1000,selfdmg:0},
};
/***************** game code *********************************************************/
/********** add, get, update User from db *********************************************/
var addUser = function(data,cb){
	db.player.insert({
		username:data.username,
		password:data.password,
		lvl:1,
		exp:0,
		guild:undefined,
		guildmaster:false,
		infight:false,
		type:data.type,
		atk1:data.atk1,
		atk2:data.atk2,
		atk3:data.atk3,
		wins:0,
		loses:0,
		elo:1000,
	},
	function(err){ //no need of res cause there is no return from the database!
		cb();
	});
}
var getUser = function(data,cb){
	db.player.find({username:data.username},function(err,res){
		var player = res;console.log(res);
		return player;
	
	});
}
var updateUser = function(data,cb){
	try{
		db.player.update({username:data.username}, {$set: {
			lvl:PLAYER_LIST[data.username].lvl,
			guild:PLAYER_LIST[data.username].guild,
			
		}}); 
		delete PLAYER_LIST[socket.id];
	} catch(err){
		
	}
}
/**************************** SOCKETS ON CONNECTION *************************************/
io.sockets.on('connection', function(socket){ //a player connects and creates a socket to interact with
	//DEBUGGING: CONNECTED CLIENTS
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
						//opponentInit(socket);
						socket.id = username; //set id of socket from logged in player to his username
						res[0].socket = socket; //
						PLAYER_LIST[username] = res[0];
						console.log(PLAYER_LIST);
						socket.emit('getMyData', {username:username,lvl:res[0].lvl,guild:res[0].guild,guildmaster:res[0].guildmaster,exp:res[0].exp,infight:res[0].infight});
						ready({username:username}); //shows up in opponent list of the otherguild
					});
					socket.emit('signInResponse', {success:true});
				}
			} else { // wird nicht eingeloggt
				socket.emit('signInResponse', {success:false});
			}	
		});
	});
	//GIVEUP
	socket.on('giveUp', function(){
		var fightId;
		var enemyUsername;
		for(var key in FIGHT_LIST){
			if(FIGHT_LIST[key].opponentUsername == socket.id){
				fightId = key;
				enemyUsername = FIGHT_LIST[key].challengerUsername;
			} else if(FIGHT_LIST[key].challengerUsername == socket.id){
				fightId = key;
				enemyUsername = FIGHT_LIST[key].opponentUsername;
			} 
		}
		var data = {
			username: socket.id,
			enemyUsername: enemyUsername,
			fightId : fightId,
		}
		aufgeben(data);
	});
	//CHALLENGED 
	socket.on('challengeChoice', function(data){
		if(data.choice){//create fight
			var challengerInFight = false;
			var opponentInFight = false;
			for(var key in FIGHT_LIST){
				if(FIGHT_LIST[key].opponentUsername == data.challengerUsername ||
				FIGHT_LIST[key].challengerUsername == data.challengerUsername){
					challengerInFight = true;
				}
				if(FIGHT_LIST[key].opponentUsername == socket.id ||
				FIGHT_LIST[key].challengerUsername == socket.id){
					opponentInFight = true;
				}
			}
			if(challengerInFight){
				socket.emit('addToChat', {message: 'Der Herausforderer befindet sich mittlerweile bereits im Kampf!',color:'info'});
			} else if(opponentInFight){
				socket.emit('addToChat', {message: 'Du befindest dich aktuell noch im Kampf',color:'info'});
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
					atk1:PLAYER_LIST[data.challengerUsername].atk1,
					atk2:PLAYER_LIST[data.challengerUsername].atk2,
					atk3:PLAYER_LIST[data.challengerUsername].atk3,
					atk1Strong:ATTACKS[PLAYER_LIST[data.challengerUsername].atk1].strong,
					atk2Strong:ATTACKS[PLAYER_LIST[data.challengerUsername].atk2].strong,
					atk3Strong:ATTACKS[PLAYER_LIST[data.challengerUsername].atk3].strong,
					type:PLAYER_LIST[data.challengerUsername].type,
					enemyType:PLAYER_LIST[socket.id].type,
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
					atk1:PLAYER_LIST[socket.id].atk1,
					atk2:PLAYER_LIST[socket.id].atk2,
					atk3:PLAYER_LIST[socket.id].atk3,
					atk1Strong:ATTACKS[PLAYER_LIST[socket.id].atk1].strong,
					atk2Strong:ATTACKS[PLAYER_LIST[socket.id].atk2].strong,
					atk3Strong:ATTACKS[PLAYER_LIST[socket.id].atk3].strong,
					type:PLAYER_LIST[socket.id].type,
					enemyType:PLAYER_LIST[data.challengerUsername].type,
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
		try{
			PLAYER_LIST[data.opponentUsername].socket.emit('challenged', {challengerUsername:socket.id});
		} catch(err){
			
		}
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
		console.log('Connected clients:', numClients);
		//1. Kampf aufgeben (verlieren), Kampf löschen
		for(var i in FIGHT_LIST){
			if(socket.id == FIGHT_LIST[i].challengerUsername){
				data = {
					username:socket.id,
					enemyUsername:FIGHT_LIST[i].opponentUsername,
					fightId:i,
					disconnect:true,
				}
				try{
				aufgeben(data);
				} catch (err){
				console.log('FUCKING ERROR');
				}
				delete FIGHT_LIST[i];
			} else if (socket.id == FIGHT_LIST[i].opponentUsername){
				data = {
					username:socket.id,
					enemyUsername:FIGHT_LIST[i].challengerUsername,
					fightId:i,
					disconnect:true,
				}
				try{
				aufgeben(data);
				} catch(err) {
				console.log('FUCKING ERROR');
				}
				delete FIGHT_LIST[i];
			}
		}
		//2. Daten des ausgeloggten Spielers aus der Spielerliste in die DB schieben, Spieler aus Liste löschen
		try{
			var exp = PLAYER_LIST[socket.id].exp;
			var playerlvl = 1;
			for(var i = 2; i <= 100; i++){
				if(exp >= Math.pow(i,2)){
					playerlvl = i;
				}
			}
			
			db.player.update({username:socket.id}, {$set: 
				{exp:PLAYER_LIST[socket.id].exp,
				lvl:playerlvl,
				atk1:PLAYER_LIST[socket.id].atk1,
				atk2:PLAYER_LIST[socket.id].atk2,
				atk3:PLAYER_LIST[socket.id].atk3,
				type:PLAYER_LIST[socket.id].type,
				/*elo:PLAYER_LIST[socket.id].elo,*/ //redundant
				}});
			delete PLAYER_LIST[socket.id];
			numClients--;
		} catch(err){
			
		}
		//3. Allen mitteilen, dass man nicht mehr anzutreffen ist
		busy({username:socket.id});
	});
	//SIGNUP
	socket.on('signUp', function(data){
		if(data.username.length <= 20 && data.username.length >= 1 && data.password.length >= 4){
			isUsernameTaken(data,function(res){
				if(res){
					socket.emit('signUpResponse', {success:false});
				} else {
					addUser(data,function(){ //when all is done, say client that it was success (callback)
						//user with default values was created
						socket.emit('signUpResponse', {success:true});
						
						
							
								if(PLAYER_LIST[data.username] != undefined){ //already logged in!
									socket.emit('alreadyLoggedIn', {});
								} else {
									numClients++;
									db.player.find({username:data.username},function(err,res){
										//res.length == 1
										var username = res[0].username; //take username of logged in player from db
						
										//opponentInit(socket);
										socket.id = username; //set id of socket from logged in player to his username
										res[0].socket = socket; //
										PLAYER_LIST[username] = res[0];
										console.log(PLAYER_LIST);
										socket.emit('getMyData', {username:username,lvl:res[0].lvl,guild:res[0].guild,guildmaster:res[0].guildmaster,exp:res[0].exp,infight:res[0].infight});
										ready({username:username}); //shows up in opponent list of the otherguild
									});
									socket.emit('signInResponse', {success:true});
								}
							
						
						
					});
				}		
			});
		} else {
			socket.emit('signUpResponse', {success:false});
			socket.emit('addToInfoBox', {message:'Your username can only contain 1 to 20 characters and your password must be at least 4 characters!'});
		}
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
				PLAYER_LIST[data.to].socket.emit('whisperForMe', {message:'flüstern von '+socket.id+": "+data.message});
			}
		} else {
			socket.emit('whisperFail', {to:data.to});
		}
	});
	//atack authentification
	socket.on('atk1', function(){
		if(PLAYER_LIST[socket.id] != undefined){ //spieler muss on sein zum angreifen
	console.log(PLAYER_LIST[socket.id].atk1);
	console.log(ATTACKS[PLAYER_LIST[socket.id].atk1]);
			var atkDmg;
			if(ATTACKS[PLAYER_LIST[socket.id].atk1].dmg.dmgFrom != undefined){
				var atkDmgFrom = ATTACKS[PLAYER_LIST[socket.id].atk1].dmg.dmgFrom;
				var atkDmgTo = ATTACKS[PLAYER_LIST[socket.id].atk1].dmg.dmgTo;
				var atkDmgRange = atkDmgTo - atkDmgFrom +1;
				console.log('dmgfrom: '+atkDmgFrom+'  dmgto: '+atkDmgTo+'  dmgrange: '+atkDmgRange);
				atkDmg = atkDmgFrom + Math.random()*atkDmgRange;
			} else {
				atkDmg = ATTACKS[PLAYER_LIST[socket.id].atk1].dmg;
			}
			var atkCrit = ATTACKS[PLAYER_LIST[socket.id].atk1].crit;
			var atkSelfDmg;
			if(ATTACKS[PLAYER_LIST[socket.id].atk1].selfdmg.dmgFrom != undefined){
				var atkSelfDmgFrom = ATTACKS[PLAYER_LIST[socket.id].atk1].selfdmg.dmgFrom;
				var atkSelfDmgTo = ATTACKS[PLAYER_LIST[socket.id].atk1].selfdmg.dmgTo;
				var atkSelfDmgRange = atkSelfDmgTo - atkSelfDmgFrom + 1;
				console.log('selfdmgfrom: '+atkSelfDmgFrom+'  selfdmgto: '+atkSelfDmgTo+'  selfdmgrange: '+atkSelfDmgRange);
				atkSelfDmg = atkSelfDmgFrom + Math.random()*atkSelfDmgRange;
			} else {
				atkSelfDmg = ATTACKS[PLAYER_LIST[socket.id].atk1].selfdmg;
			}			var atkType = ATTACKS[PLAYER_LIST[socket.id].atk1].type;
			var atkStrong = ATTACKS[PLAYER_LIST[socket.id].atk1].strong;
			var atkHit = ATTACKS[PLAYER_LIST[socket.id].atk1].hit;
			
			console.log('IN ATK 1 atkStrong: '+atkStrong);
			
			schadenAnrichten({atkName:PLAYER_LIST[socket.id].atk1,atkDmg:atkDmg,atkSelfDmg:atkSelfDmg,atkCrit:atkCrit,atkHit:atkHit,atkType:atkType,atkStrong:atkStrong,fightId:PLAYER_LIST[socket.id].infight,socket:socket});
		}
	});
	socket.on('atk2', function(){
			if(PLAYER_LIST[socket.id] != undefined){ //spieler muss on sein zum angreifen
	console.log(PLAYER_LIST[socket.id].atk2);
	console.log(ATTACKS[PLAYER_LIST[socket.id].atk2]);
						var atkDmg;
			if(ATTACKS[PLAYER_LIST[socket.id].atk2].dmg.dmgFrom != undefined){
				var atkDmgFrom = ATTACKS[PLAYER_LIST[socket.id].atk2].dmg.dmgFrom;
				var atkDmgTo = ATTACKS[PLAYER_LIST[socket.id].atk2].dmg.dmgTo;
				var atkDmgRange = atkDmgTo - atkDmgFrom + 1;
				console.log('dmgfrom: '+atkDmgFrom+'  dmgto: '+atkDmgTo+'  dmgrange: '+atkDmgRange);
				atkDmg = atkDmgFrom + Math.random()*atkDmgRange;
			} else {
				atkDmg = ATTACKS[PLAYER_LIST[socket.id].atk2].dmg;
			}
			atkCrit = ATTACKS[PLAYER_LIST[socket.id].atk2].crit;
			var atkSelfDmg;
			if(ATTACKS[PLAYER_LIST[socket.id].atk2].selfdmg.dmgFrom != undefined){
				var atkSelfDmgFrom = ATTACKS[PLAYER_LIST[socket.id].atk2].selfdmg.dmgFrom;
				var atkSelfDmgTo = ATTACKS[PLAYER_LIST[socket.id].atk2].selfdmg.dmgTo;
				var atkSelfDmgRange = atkSelfDmgTo - atkSelfDmgFrom + 1;
				console.log('selfdmgfrom: '+atkSelfDmgFrom+'  selfdmgto: '+atkSelfDmgTo+'  selfdmgrange: '+atkSelfDmgRange);
				atkSelfDmg = atkSelfDmgFrom + Math.random()*atkSelfDmgRange;
			} else {
				atkSelfDmg = ATTACKS[PLAYER_LIST[socket.id].atk2].selfdmg;
			}			atkType = ATTACKS[PLAYER_LIST[socket.id].atk2].type;
			atkStrong = ATTACKS[PLAYER_LIST[socket.id].atk2].strong;
			atkHit = ATTACKS[PLAYER_LIST[socket.id].atk2].hit;
						console.log('IN ATK 2 atkStrong: '+atkStrong);

			schadenAnrichten({atkName:PLAYER_LIST[socket.id].atk2,atkDmg:atkDmg,atkSelfDmg:atkSelfDmg,atkCrit:atkCrit,atkHit:atkHit,atkType:atkType,atkStrong:atkStrong,fightId:PLAYER_LIST[socket.id].infight,socket:socket});
		}
	});
	socket.on('atk3', function(){
		if(PLAYER_LIST[socket.id] != undefined){ //spieler muss on sein zum angreifen
	console.log(PLAYER_LIST[socket.id].atk3);
	console.log(ATTACKS[PLAYER_LIST[socket.id].atk3]);
			var atkDmg;
			if(ATTACKS[PLAYER_LIST[socket.id].atk3].dmg.dmgFrom != undefined){
				var atkDmgFrom = ATTACKS[PLAYER_LIST[socket.id].atk3].dmg.dmgFrom;
				var atkDmgTo = ATTACKS[PLAYER_LIST[socket.id].atk3].dmg.dmgTo;
				var atkDmgRange = atkDmgTo - atkDmgFrom + 1;
				console.log('dmgfrom: '+atkDmgFrom+'  dmgto: '+atkDmgTo+'  dmgrange: '+atkDmgRange);
				atkDmg = atkDmgFrom + Math.random()*atkDmgRange;
			} else {
				atkDmg = ATTACKS[PLAYER_LIST[socket.id].atk3].dmg;
			}
			var atkCrit = ATTACKS[PLAYER_LIST[socket.id].atk3].crit;
			var atkSelfDmg;
			if(ATTACKS[PLAYER_LIST[socket.id].atk3].selfdmg.dmgFrom != undefined){
				var atkSelfDmgFrom = ATTACKS[PLAYER_LIST[socket.id].atk3].selfdmg.dmgFrom;
				var atkSelfDmgTo = ATTACKS[PLAYER_LIST[socket.id].atk3].selfdmg.dmgTo;
				var atkSelfDmgRange = atkSelfDmgTo - atkSelfDmgFrom + 1;
				console.log('selfdmgfrom: '+atkSelfDmgFrom+'  selfdmgto: '+atkSelfDmgTo+'  selfdmgrange: '+atkSelfDmgRange);
				atkSelfDmg = atkSelfDmgFrom + Math.random()*atkSelfDmgRange;
			} else {
				atkSelfDmg = ATTACKS[PLAYER_LIST[socket.id].atk3].selfdmg;
			}
			var atkType = ATTACKS[PLAYER_LIST[socket.id].atk3].type;
			var atkStrong = ATTACKS[PLAYER_LIST[socket.id].atk3].strong;
			var atkHit = ATTACKS[PLAYER_LIST[socket.id].atk3].hit;
						console.log('IN ATK 3 atkStrong: '+atkStrong);

			schadenAnrichten({atkName:PLAYER_LIST[socket.id].atk3,atkDmg:atkDmg,atkSelfDmg:atkSelfDmg,atkCrit:atkCrit,atkHit:atkHit,atkType:atkType,atkStrong:atkStrong,fightId:PLAYER_LIST[socket.id].infight,socket:socket});
		}
	});

	socket.on('logout', function(){
		try{
			var exp = PLAYER_LIST[socket.id].exp;
			var playerlvl = 1;
			for(var i = 2; i <= 100; i++){
				if(exp >= Math.pow(i,2)){
					playerlvl = i;
				}
			}
			
			db.player.update({username:socket.id}, {$set: 
				{exp:PLAYER_LIST[socket.id].exp,
				lvl:playerlvl,
				atk1:PLAYER_LIST[socket.id].atk1,
				atk2:PLAYER_LIST[socket.id].atk2,
				atk3:PLAYER_LIST[socket.id].atk3,
				type:PLAYER_LIST[socket.id].type,
				}});
			delete PLAYER_LIST[socket.id];
			numClients--;
		} catch(err){
			
		}
		busy({username:socket.id});
	});
	
	//GUILD
	socket.on('guildCreate', function(data){
		if(PLAYER_LIST[socket.id].guild != undefined && PLAYER_LIST[socket.id].guild != 'none'){
			socket.emit('addToChat', {message:'You have to leave your current guild first! <code>/gleave</code>',color:'info'});
		} else {
			var existiertBereits = false;
			db.player.find({guild:data.guildname},function(err,res){
				if(res.length >= 1){
					existiertBereits = true;
				}
			});
			if(existiertBereits){
				socket.emit('addToChat',{message:'The guild name '+data.guildname+' has already been taken!', color: 'warning'});
			} else {
				socket.emit('addToChat',{message:'The guild '+data.guildname+' has been created!',color:'info'});
				//gilde wird erstellt
				PLAYER_LIST[socket.id].guildmaster = true;
				PLAYER_LIST[socket.id].guild = data.guildname;
				db.player.update({username:socket.id},{$set:{guild:data.guildname,guildmaster:true}});
			}
		}
	});
	socket.on('guildKick', function(data){
		if(PLAYER_LIST[socket.id].guildmaster){
			try{
				PLAYER_LIST[data.username].socket.emit('addToChat', {message:'You were kicked from the guild '+PLAYER_LIST[data.username].guild+'!',color:'warning'});
				PLAYER_LIST[data.username].guild = undefined;
				db.player.update({username:data.username},{$set:{guild:undefined}});
			} catch (err){
				socket.emit('addToChat', {message:'The player '+data.username+' is not in your guild!', color: 'error'});
			}
		} else {
			socket.emit('addToChat', {message:'Only the guild master can kick people from the guild!', color:'error'});
		}
	});
	socket.on('guildDelete', function(data){
		//bei jedem member gilde auf undefined setzen und sie informieren
		if(PLAYER_LIST[socket.id].guildmaster){
			var guild = PLAYER_LIST[socket.id].guild;
			for(var key in PLAYER_LIST){
				if(PLAYER_LIST[key].guild = guild){
					PLAYER_LIST[key].guild = undefined;
					PLAYER_LIST[key].socket.emit('addToChat', {message:'Your guild '+guild+' has been deleted!',color:'error'});
					//db.player.update({username:key},{$set:{guild:undefined}},{multi:true});
				}
			}
			db.player.update({guild:guild},{$set:{guild:undefined}},{multi:true});
		} else {
			socket.emit('addToChat', {message:'Only the guild master can delete the guild!', color:'warning'});
		}
	});
	socket.on('guildInvite', function(data){
		if(PLAYER_LIST[socket.id] == undefined){
			socket.emit('addToChat', {message:'You are in no guild!',color:'warning'});
		} else if(PLAYER_LIST[data.username].guild != undefined){
			socket.emit('addToChat', {message:'The invited player has to leave his current guild before he can join yours!',color:'warning'});
		} else {
			try{
				var guildname = PLAYER_LIST[socket.id].guild;
				PLAYER_LIST[data.username].socket.emit('guildInvite', {guildname:guildname,username:socket.id});
			} catch(err){
				socket.emit('addToChat',{message:'This player does not exist or is not online!',color:'warning'});
			}
		}
	});
	socket.on('guildJoin', function(data){
		PLAYER_LIST[socket.id].guild = data.guildname;
		PLAYER_LIST[socket.id].guildmaster = false;
		db.player.update({username:socket.id},{$set:{guild:data.guildname,guildmaster:false}});
		socket.emit('addToChat',{message:'You are now member of the guild '+data.guildname,color:'info'});
	});
	socket.on('guildLeave', function(data){
		PLAYER_LIST[socket.id].guild = undefined;
		db.player.update({username:socket.id},{$set:{guild:undefined,guildmaster:false}});
	});
	socket.on('guildMessage', function(data){
		if(PLAYER_LIST[socket.id].guild != undefined){
			for(var key in PLAYER_LIST){
				if(PLAYER_LIST[key].guild == PLAYER_LIST[socket.id].guild){ //gildenmitglied
					PLAYER_LIST[key].socket.emit('addToChat', {message:PLAYER_LIST[socket.id].guild+' - '+socket.id+': '+data.message,color:'guild'});
				}
			}
		} else {
			socket.emit('addToChat', {message:'You are in no guild! You can create one with <code>/gcreate [guildname]</code>.',color:'warning'});
		}
	});
	
	//BEST LIST
	socket.on('getBestData', function(){
		//$gt:0 means greater than 1
		//sort will sort that the document with the highest lvl comes first
		//skip can skip some of the first documents (for next pages)
		//limit limits the amount of documents
		db.player.find({elo:{$gt:0}}).sort({elo:-1}).skip(0).limit(100, function(err,res){
			socket.emit('sendBestData', res);
		});
	});
});

var opponentInit = function(socket){
	var clear = true;
	for(var key in PLAYER_LIST){//needs to get entrys of all possible opponents at this time, //todo - all in one array, now: every single
		if(key != socket.id){//PLAYER_LIST[key].infight == false || PLAYER_LIST[key].infight >= 0
			socket.emit('opponentInit', {username:key,clear:clear,elo:PLAYER_LIST[key].elo});
			clear = false;
		}	
	}
};

var aufgeben = function(data){
	//Belohnungen verteilens
	//elo anpassen beider spieler
	eloAnpassen({A:data.username,  B:data.enemyUsername, S_A: 0, S_B: 1});
	try{
		PLAYER_LIST[data.enemyUsername].exp += 2;
		PLAYER_LIST[data.enemyUsername].socket.emit('addToChat',{message:'Your enemy disconnected or gave up! (You gain 2 exp)',color:'info'});
		PLAYER_LIST[data.enemyUsername].socket.emit('getMyData', {exp:PLAYER_LIST[data.username].exp});
		PLAYER_LIST[data.enemyUsername].infight = false;
		PLAYER_LIST[data.enemyUsername].socket.emit('endFight', {fightId: data.fightId});
		//opponentInit(PLAYER_LIST[data.enemyUsername].socket);
	if(!data.disconnect){
		ready({username:data.enemyUsername});
	}
	}catch(err){
		
	}
	
	try{
		PLAYER_LIST[data.username].socket.emit('addToChat',{message:'You gave up!',color:'info'});
		PLAYER_LIST[data.username].infight = false;
		PLAYER_LIST[data.username].socket.emit('endFight', {fightId: data.fightId});
		//opponentInit(PLAYER_LIST[data.username].socket);
		ready({username:data.username});
	}catch(err){
		
	}
	
	delete FIGHT_LIST[data.fightId];
}

var eloAnpassen = function(data){
	try{
		db.player.find({username:data.A}, function(err,res){
			var R_A = res[0].elo; //alte elo von A
			console.log(R_A);
			db.player.find({username:data.B}, function(err,res2){
				console.log(data.A);
				console.log(data.B);
				var R_B = res2[0].elo; //alte elo von B
				console.log(R_B);
				ret = gameScripts.elo(R_A,R_B,data.S_A,data.S_B);
				console.log(ret);
				db.player.update({username:data.A}, {$set: {
					elo:ret.R_A,
				}}); 
				db.player.update({username:data.B}, {$set: {
					elo:ret.R_B,
				}}); 
				try{
					PLAYER_LIST[data.A].socket.emit('addToChat', {message:'You gain '+  ret.R_Delta+' elo',color:'info'});
					PLAYER_LIST[data.A].elo = ret.R_A;
					ready({username:data.A,elo:ret.R_A});
				} catch(err){
					
				}
				try{
					PLAYER_LIST[data.B].socket.emit('addToChat', {message:'You gain '+ -ret.R_Delta+' elo',color:'info'});
					PLAYER_LIST[data.B].elo = ret.R_B;
					ready({username:data.B,elo:ret.R_B});
				} catch(err){
					
				}
			}); 
		});
	}catch(err){
		console.log('catch!');
	}
}

var schadenAnrichten = function(data){
	var fightId = data.fightId;
	var socket = data.socket;
	//ist er auch wirklich am zug???
	if(hisTurn(socket.id,fightId)){ //name und fightId
		var newHp;
		var newHpMe;
		var nameOfTheOther = '';
		var typeOfOther = '';
		var critMult = 1;
		var hitMult = 1;
		if(Math.random() < 1-data.atkHit){
			hitMult = 0;
			//socket.emit('addToChat',{message:'MISS!', color:'info'});
			socket.emit('eventMessage', {message: 'MISS'});
		} else {
			if(Math.random() < data.atkCrit){
				critMult = 1.5;				
			}
		}//END OF MISS
			data.atkDmg *= critMult;
			data.atkDmg *= hitMult;
			data.atkDmg = Math.round(data.atkDmg); //DAMAGE wird gerundet... hübscher so
			console.log(data.atkDmg);
			data.atkSelfDmg = Math.round(data.atkSelfDmg); //Heal wird gerundet.. bzw selfdmg
			console.log(data.atkSelfDmg);
			
		if(FIGHT_LIST[fightId].opponentUsername === socket.id){ //opponent - thats me: opponent attacks
			nameOfTheOther = FIGHT_LIST[fightId].challengerUsername;
			typeOfOther = PLAYER_LIST[nameOfTheOther].type;
			if(critMult == 1.5){
				socket.emit('eventMessage', {message:'CRIT (MULT 1.5)'});
				PLAYER_LIST[nameOfTheOther].socket.emit('eventMessage', {message:'CRIT (MULT 1.5)'});
			}
			if(typeOfOther === data.atkStrong){
				data.atkDmg *= 1.15;
				data.atkDmg = Math.round(data.atkDmg);
				socket.emit('addToChat', {message:data.atkName+' was strong against '+typeOfOther+' (MULT 1.15)',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat', {message:data.atkName+' was strong against '+typeOfOther+' (MULT 1.15)',color:'info'});
			}
			//dmg
			FIGHT_LIST[fightId].challengerHp -= data.atkDmg;
			if(FIGHT_LIST[fightId].challengerHp > 100){
				FIGHT_LIST[fightId].challengerHp = 100;
			}
			//selfdmg
			FIGHT_LIST[fightId].opponentHp -= data.atkSelfDmg;
			if(FIGHT_LIST[fightId].opponentHp > 100){
				FIGHT_LIST[fightId].opponentHp = 100;
			}
			//chat info
			if(data.atkSelfDmg > 0){
				socket.emit('addToChat',{message:'You hit yourself for '+data.atkSelfDmg+' damage!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'Your enemy hit himself for '+data.atkSelfDmg+' damage!',color:'info'});
			} else if(data.atkSelfDmg < 0) {
				socket.emit('addToChat',{message:-data.atkSelfDmg+' heal!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'Your enemy healed himself for '+-data.atkSelfDmg+'!',color:'info'});
			}
			if(data.atkDmg > 0){
				socket.emit('addToChat',{message:data.atkDmg+' damage!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'You took '+data.atkDmg+' damage!',color:'info'});
			} else if(data.atkDmg < 0){
				socket.emit('addToChat',{message:'You healed your enemy for '+-data.atkDmg+'!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'Your enemy healed you for '+-data.atkDmg+'!',color:'info'});
			}
			
			newHp = FIGHT_LIST[fightId].challengerHp;
			newHpMe = FIGHT_LIST[fightId].opponentHp;
		} else { //challenger attacks
			nameOfTheOther = FIGHT_LIST[fightId].opponentUsername;
			typeOfOther = PLAYER_LIST[nameOfTheOther].type;
			if(critMult == 1.5){
				socket.emit('eventMessage', {message:'CRIT (MULT 1.5)'});
				PLAYER_LIST[nameOfTheOther].socket.emit('eventMessage', {message:'CRIT (MULT 1.5)'});
			}
			if(typeOfOther === data.atkStrong){
				data.atkDmg *= 1.15;
				data.atkDmg = Math.round(data.atkDmg);
				socket.emit('addToChat', {message:data.atkName+' was strong against '+typeOfOther,color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat', {message:data.atkName+' was strong against '+typeOfOther,color:'info'});
			}
			//dmg
			FIGHT_LIST[fightId].opponentHp -= data.atkDmg;
			if(FIGHT_LIST[fightId].opponentHp > 100){
				FIGHT_LIST[fightId].opponentHp = 100;
			}
			//selfdmg
			FIGHT_LIST[fightId].challengerHp -= data.atkSelfDmg;
			if(FIGHT_LIST[fightId].challengerHp > 100){
				FIGHT_LIST[fightId].challengerHp = 100;
			}
			//chat info
			if(data.atkSelfDmg > 0){
				socket.emit('addToChat',{message:'You hit yourself for '+data.atkSelfDmg+' damage!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'Your enemy hit himself for '+data.atkSelfDmg+' damage!',color:'info'});
			} else if(data.atkSelfDmg < 0) {
				socket.emit('addToChat',{message:-data.atkSelfDmg+' heal!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'Your enemy healed himself for '+-data.atkSelfDmg+'!',color:'info'});
			}
			if(data.atkDmg > 0){
				socket.emit('addToChat',{message:data.atkDmg+' damage!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'You took '+data.atkDmg+' damage!',color:'info'});
			} else if(data.atkDmg < 0){
				socket.emit('addToChat',{message:'You healed your enemy for '+-data.atkDmg+'!',color:'info'});
				PLAYER_LIST[nameOfTheOther].socket.emit('addToChat',{message:'Your enemy healed you for '+-data.atkDmg+'!',color:'info'});
			}
			

			newHp = FIGHT_LIST[fightId].opponentHp;
			newHpMe = FIGHT_LIST[fightId].challengerHp;
		}
		FIGHT_LIST[fightId].turn = nameOfTheOther;
		PLAYER_LIST[nameOfTheOther].socket.emit('yourEnemyTookDmg',{newHp:newHpMe,myturn:true});
		socket.emit('takeDmg',{newHp:newHpMe});
		PLAYER_LIST[nameOfTheOther].socket.emit('takeDmg', {newHp:newHp,myturn:true,atkName:data.atkName}); //attacked person will recognize
		socket.emit('yourEnemyTookDmg', {newHp:newHp}); //attacking person will recognize
		//Entscheiden, wer gewonnen hat (Unentschieden ODER selbst getötet ODER gewonnen)
		if(newHp <= 0 && newHpMe <=0){
			eloAnpassen({A:socket.id,  B:nameOfTheOther, S_A:0.5, S_B:0.5});
			socket.emit('endFight', {fightId:fightId});
			PLAYER_LIST[nameOfTheOther].socket.emit('endFight', {fightId:fightId});
			//Belohnungen verteilens
			PLAYER_LIST[socket.id].exp += 3;
			PLAYER_LIST[nameOfTheOther].exp += 3;
			socket.emit('addToChat', {message:'Draw! (You gain 3 exp)',color:'info'});
			PLAYER_LIST[nameOfTheOther].socket.emit('addToChat', {message:'Draw! (You gain 3 exp)',color:'info'});
			socket.emit('getMyData', {username:socket.id ,exp:PLAYER_LIST[socket.id].exp});
			PLAYER_LIST[nameOfTheOther].socket.emit('getMyData', {username:nameOfTheOther ,exp:PLAYER_LIST[nameOfTheOther].exp});
			ready({username:socket.id});
			ready({username:nameOfTheOther});
			delete FIGHT_LIST[fightId];
		} else if(newHpMe <= 0){
			eloAnpassen({A:socket.id,  B:nameOfTheOther, S_A:0, S_B:1});
			socket.emit('endFight', {fightId:fightId});
			PLAYER_LIST[nameOfTheOther].socket.emit('endFight', {fightId:fightId});
			//Belohnungen verteilens
			PLAYER_LIST[socket.id].exp += 3;
			PLAYER_LIST[nameOfTheOther].exp += 5;
			socket.emit('addToChat', {message:'You killed yourself - you lose! (You gain 3 exp)',color:'info'});
			PLAYER_LIST[nameOfTheOther].socket.emit('addToChat', {message:socket.id+' killed himself - you won! (You gain 5 exp)',color:'info'});
			socket.emit('getMyData', {username:socket.id ,exp:PLAYER_LIST[socket.id].exp});
			PLAYER_LIST[nameOfTheOther].socket.emit('getMyData', {username:nameOfTheOther ,exp:PLAYER_LIST[nameOfTheOther].exp});
			ready({username:socket.id});
			ready({username:nameOfTheOther});
			delete FIGHT_LIST[fightId];
		} else if(newHp <= 0){
			eloAnpassen({A:socket.id,  B:nameOfTheOther, S_A:1, S_B:0});
			socket.emit('endFight', {fightId:fightId});
			PLAYER_LIST[nameOfTheOther].socket.emit('endFight', {fightId:fightId});
			//Belohnungen verteilens
			PLAYER_LIST[socket.id].exp += 5;
			PLAYER_LIST[nameOfTheOther].exp += 2;
			socket.emit('addToChat', {message:'You won! (You gain 5 exp)',color:'info'});
			PLAYER_LIST[nameOfTheOther].socket.emit('addToChat', {message:socket.id+' won! (You gain 2 exp)',color:'info'});
			socket.emit('getMyData', {username:socket.id ,exp:PLAYER_LIST[socket.id].exp});
			PLAYER_LIST[nameOfTheOther].socket.emit('getMyData', {username:nameOfTheOther ,exp:PLAYER_LIST[nameOfTheOther].exp});
			ready({username:socket.id});
			ready({username:nameOfTheOther});
			delete FIGHT_LIST[fightId];	
		} 
	}
}

var hisTurn = function(name,fightId){
	try{
		return name === FIGHT_LIST[fightId].turn;
	} catch(err){ //fight over
		return false;
	}
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
	READY_LIST[data.username] = PLAYER_LIST[data.username].elo;
	sendNewOpponentList();
}
//show everybody he went off / went into fight
function busy(data){
	delete READY_LIST[data.username];
	sendNewOpponentList();
}
function sendNewOpponentList(){
	for(var key in PLAYER_LIST){
		var string = '';
		for(var keyInner in READY_LIST){
			if(key != keyInner){//all players; allReadyPlayers
				string+='<div id="'+keyInner+'" class="possibleOpponent " style="border:1px dashed black;margin:0px;padding:0px">'+keyInner+' - elo: '+READY_LIST[keyInner]+'</div><br/>';
			}
		}
		PLAYER_LIST[key].socket.emit('currentOpponentList', {string:string});
	}
}
	

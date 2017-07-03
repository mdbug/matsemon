
	var socket = io();
	/**************************************** VARIABLES BEGIN ***************************************************/
	/* DOM-ELEMENTS BY ID */
	/* NAMEN ENTSPRECHEN EXAKT IHRER ID! BITTE SO BEIBEHALTEN! */
	var containerDiv = document.getElementById('containerDiv');
	/* DEN DOM-ELEMENTEN KANN PER VARIABLEN-NAME EIN EVENT HINZUGEFÜGT WERDEN ( xyzDiv-xyz-xyz.onclick = function(){} ) */
	var headerDiv = document.getElementById('headerDiv');
	//var chatDivMyInfo = document.getElementById('chatDivMyInfo');
	var  chatDivInfoUsername = document.getElementById('chatDivInfoUsername');
	var  chatDivInfoLvl = document.getElementById('chatDivInfoLvl');
	var  chatDivInfoExp = document.getElementById('chatDivInfoExp');
	var  chatDivInfoGuild = document.getElementById('chatDivInfoGuild');
	var  chatDivInfoGuildmaster = document.getElementById('chatDivInfoGuildmaster');
	var  chatDivInfoInfight = document.getElementById('chatDivInfoInfight');
	//auskommentiert, weil server nicht online auf den die src-verweise hinführen.
	var audio1 = document.getElementById('audio1');
	var audio2 = document.getElementById('audio2');
	var audio3 = document.getElementById('audio3');
	var audio4 = document.getElementById('audio4');
	var audio5 = document.getElementById('audio5');
	var audio6 = document.getElementById('audio6');
	var audio7 = document.getElementById('audio7');
	var audio8 = document.getElementById('audio8');
	var signDiv = document.getElementById('signDiv');
	var signDivUsername = document.getElementById('signDivUsername');
	var signDivPassword = document.getElementById('signDivPassword');
	var signDivSignIn = document.getElementById('signDivSignIn');
	var signDivSignUp = document.getElementById('signDivSignUp');
	var chatDiv = document.getElementById('chatDiv');
	var chatDivText = document.getElementById('chatDivText');
	var chatDivForm = document.getElementById('chatDivForm');
	var chatDivFormInput = document.getElementById('chatDivFormInput');
	var bestDiv = document.getElementById('bestDiv');
	var opponentDiv = document.getElementById('opponentDiv');
	var opponentDivList = document.getElementById('opponentDivList');
	var chooseDiv = document.getElementById('chooseDiv');
	var chooseDivConfirm = document.getElementById('chooseDivConfirm');
	var chooseDivConfirmYes = document.getElementById('chooseDivConfirmYes');
	var chooseDivConfirmNo = document.getElementById('chooseDivConfirmNo');
	var fightDiv = document.getElementById('fightDiv');
	var fightDivAnimations = document.getElementById('fightDivAnimations');
	var fightDivMyHp = document.getElementById('fightDivMyHp');
	var fightDivEnemyHp = document.getElementById('fightDivEnemyHp');
	var fightDivAttacks = document.getElementById('fightDivAttacks');
	var fightDivAttacksButton1 = document.getElementById('fightDivAttacksButton1');
	var fightDivAttacksButton2 = document.getElementById('fightDivAttacksButton2');
	var fightDivAttacksButton3 = document.getElementById('fightDivAttacksButton3');
	var fightDivAttacksButton4 = document.getElementById('fightDivAttacksButton4');
	var fightDivInfo = document.getElementById('fightDivInfo');
	var fightDivInfoMyUsername = document.getElementById('fightDivInfoMyUsername');
	var fightDivInfoEnemyUsername = document.getElementById('fightDivInfoEnemyUsername');
	var fightDivInfoMyGuild = document.getElementById('fightDivInfoMyGuild');
	var fightDivInfoEnemyGuild = document.getElementById('fightDivInfoEnemyGuild');
	var fightDivInfoMyLvl = document.getElementById('fightDivInfoMyLvl');
	var fightDivInfoEnemyLvl = document.getElementById('fightDivInfoEnemyLvl');
	var fightDivInfoMyHp = document.getElementById('fightDivInfoMyHp');
	var fightDivInfoEnemyHp = document.getElementById('fightDivInfoEnemyHp');
	var fightDivInfoFightId = document.getElementById('fightDivInfoFightId');
	var fightDivInfoTurn = document.getElementById('fightDivInfoTurn');
	var infoMessageDiv = document.getElementById('infoMessageDiv');
	/* COLORS */
	var normalColor = 'white'; //normale Farbe zb für den "All-Chat" - weiß
	var whisperColor = '#f828fc'; //Flüster-Farbe - türkis
	var guildColor = '#30e52d'; //Gilden-Farbe - grün
	var infoColor = '#e5ff00'; //bei Informationen - gelb
	var warningColor = '#ffbf00'; //bei Warnungen - orange
	var errorColor = '#ff0000' //bei Fehlern - rot
	/* OTHER */
	var inChatInput = false; //Zum Herausfinden, ob der Spieler gerade etwas im Chat eintippt
	var loggedIn = false;
	var guildInvitation;
	var typeColor = {
		'mystic':'#c896ff',
		'holy':'#fdff96',
		'science':'#96ccff',
	};
	/******************************************* VARIABLES END ************************************************/
	/******************************************* FUNCTIONS BEGIN ******************************************************/
	function addToChat(data, color){
		audio6.play();
		chatDivText.innerHTML += '<div style="color:'+color+'">' + data + '</div>';
		chatDivText.scrollTop = chatDivText.scrollHeight;
	}
	function addOnclickEvents(username){
		var possibleOpponents = document.getElementsByClassName('possibleOpponent');
		for(var key in possibleOpponents){
			possibleOpponents[key].onclick = function(){
				var opponentUsername = this.id;
				socket.emit('challenge', {opponentUsername:opponentUsername});
			}
		}
	}
	/******************************************** FUNCTIONS END ***************************************************/
	/******************************************** CLIENT-EVENTS BEGIN ***********************************************/
	signDivSignUp.onclick = function(){
		document.getElementById('chooseTypeDiv').style.display = 'inline-block';
		signDiv.style.display = 'none';
		//socket.emit('signUp', {username:signDivUsername.value, password:signDivPassword.value});
	}
	signDivSignIn.onclick = function(){
		socket.emit('signIn', {username:signDivUsername.value, password:signDivPassword.value});
	}
	chooseDivConfirmYes.onclick = function(){
		socket.emit('challengeChoice', {choice:true, challengerUsername:chooseDiv.name});
		chooseDiv.style.display = 'none'; //buttons nach entscheidung wieder ausblenden
	}
	chooseDivConfirmNo.onclick = function(){
		socket.emit('challengeChoice', {choice:false, challengerUsername:chooseDiv.name});
		chooseDiv.style.display = 'none'; //buttons nach entscheidung wieder ausblenden
	}	
	chatDivFormInput.onfocus = function(){
		inChatInput = true;
	}
	chatDivFormInput.onblur = function(){
		inChatInput = false;
	}
	chatDivForm.onsubmit = function(e){
console.log('chatinputonsubmit: '+chatDivFormInput.value);
		e.preventDefault(); //no refresh of page will be happen
		if(chatDivFormInput.value !== ''){
			if(chatDivFormInput.value === '/help'){
				addToChat('Whisper: <code>/w [playername] [message]</code>, best list: <code>/best</code>, guild creation: <code>/gcreate [guildname]</code>, guild invite: <code>/ginvite [player name]</code>, guild leave: <code>/gleave</code>, guild kick: <code>/gkick [player name]</code>, guild delete: <code>/gdelete</code>				',infoColor);
			} else if(chatDivFormInput.value === '/best'){
				socket.emit('getBestData',{});
				if(bestDiv.style.display == 'inline-block'){
					bestDiv.style.display = 'none'
				} else {
					bestDiv.style.display = 'inline-block';
				}
			} else if((chatDivFormInput.value[0] === '/' && chatDivFormInput.value[1] === 'w' && chatDivFormInput.value[2] === ' ' && chatDivFormInput.value[3] != undefined) ||chatDivFormInput.value.substring(0,3) === '/W '){ //WHISPER!
				var len = 0;
				for(var el in chatDivFormInput.value.split(" ")){
					len++;
				}
				if(len>=3){
					//"/w sth msg" should only contain /w AND to AND msg -> array of at least 3 elements
					var split = chatDivFormInput.value.split(" ");
					var msg = '';
					for(var i = 2; i < split.length; i++){
						msg+=split[i]+" ";
					}
					socket.emit('sendWspToServer', {message:msg,to:split[1]});
				} else {
					addToChat('Du musst eine Nachricht angeben, wenn du versuchst etwas zu flüstern! :o', warningColor);
				}
			} else if(chatDivFormInput.value.substring(0,9) === '/gcreate '){
				if(true){
					var split = chatDivFormInput.value.split(' ');
					var guildname = '';
					for(var i = 1; i < split.length; i++){
						guildname+=split[i]+" ";
					}
					guildname = guildname.substring(0,guildname.length);
					if(guildname.length >= 1){
						if(guildname.length <= 16){
							socket.emit('guildCreate', {guildname:guildname});
						} else {
							addToChat('The guild name can contain a maximum of 16 characters!', warningColor);
						}
					} else {
						addToChat('The guild name must have at least one character!', warningColor);
					}
				}
			} else if (chatDivFormInput.value.substring(0,8) === '/gdelete'){
				socket.emit('guildDelete', {});
			} else if (chatDivFormInput.value.substring(0,9) === '/ginvite '){
				var split = chatDivFormInput.value.split(' ');
				socket.emit('guildInvite', {username:split[1]});
			} else if (chatDivFormInput.value.substring(0,7) === '/gleave'){
				socket.emit('guildLeave', {}); 
			} else if(chatDivFormInput.value.substring(0,7) === '/gkick ' ){
				var split = chatDivFormInput.value.split(' ');
				socket.emit('guildKick', {username: split[1]});
			} else if (chatDivFormInput.value.substring(0,4) === '/yes'){
				if (guildInvitation != undefined){
console.log('/yes wurde geklickt. guildInvitation ist gerade: '+guildInvitation);
					socket.emit('guildJoin', {guildname:guildInvitation});
					guildInvitation = undefined;
				}
			} else if (chatDivFormInput.value.substring(0,3) === '/no'){	
				guildInvitation = undefined;
			} else if (chatDivFormInput.value.substring(0,3) === '/g ' ||chatDivFormInput.value.substring(0,3) === '/G '){
				var split = chatDivFormInput.value.split(' ');
				var message = '';
				for(var i = 1; i < split.length; i++){
					message+=split[i]+" ";
				}
				
console.log('message is now (/g):'+message);
				socket.emit('guildMessage', {message:message});
			} else if(chatDivFormInput.value[0] === '/' && chatDivFormInput.value[1] !== 'w'){ //beim eval darf kein w am anfang stehen.....
				socket.emit('evalServer', chatDivFormInput.value.slice(1)); //EVAL
			} else {
				socket.emit('sendMsgToServer', chatDivFormInput.value);//EVERYONE
			}
			chatDivFormInput.value = '';
		}
	}
	document.onkeyup = function(event){ //KEYBOARD EVENTS
		if(!inChatInput){ //Falls der Spieler gerade nichts im Chat eingibt, zählen die Tasten 1-4 als Attackversuche und Enter als signIn-Versuch
			if(event.keyCode === 49 ){ //1
				socket.emit('atk1',{});
				fightDivAttacks.style.visibility = 'hidden'; 
			} else if(event.keyCode === 50){ //2
				socket.emit('atk2',{});
				fightDivAttacks.style.visibility = 'hidden'; 
			} else if(event.keyCode === 51){ //3
				socket.emit('atk3',{});
				fightDivAttacks.style.visibility = 'hidden'; 
			} else if(event.keyCode === 52){ //4
				socket.emit('giveUp', {});
				fightDivAttacks.style.visibility = 'hidden'; 
			} else if(event.keyCode === 13 && !loggedIn){ //Enter
				socket.emit('signIn', {username:signDivUsername.value, password:signDivPassword.value});
			}
		}
	}
	fightDivAttacksButton1.onclick = function(){
		socket.emit('atk1', {});
		shoot();
		//fightDivAttacks ausblenden
		fightDivAttacks.style.visibility = 'hidden'; 
	}
	fightDivAttacksButton2.onclick = function(){
		socket.emit('atk2', {});
		shoot();
		//fightDivAttacks ausblenden
		fightDivAttacks.style.visibility = 'hidden'; 
	}
	fightDivAttacksButton3.onclick = function(){
		socket.emit('atk3', {});
		slash();
		//fightDivAttacks ausblenden
		fightDivAttacks.style.visibility = 'hidden'; 
	}
	//GIVE UP
	fightDivAttacksButton4.onclick = function(){
		socket.emit('giveUp', {fightId:fightDivInfoFightId.innerHTML, enemyUsername:fightDivInfoEnemyUsername.innerHTML});
	}
	/********************************************* CLIENT-EVENTS END ************************************************/
	/********************************************* SERVER-RESPONSE BEGIN ********************************************/
	//SIGN-UP-RESPONSE
	socket.on('signUpResponse', function(data){
		if(data.success){
			infoMessageDiv.innerHTML = 'Sign Up successful! :)';
		} else {
			infoMessageDiv.innerHTML = 'Sign Up unsuccessful! :(';
			document.getElementById('chooseTypeDiv').style.display = 'none';
			signDiv.style.display = 'inline-block';
		}
	});
	//SIGN-IN-RESPONSE
	socket.on('signInResponse', function(data){
		if(data.success){
			loggedIn = true;
			audio1.pause();
			audio5.play();
			/* signDiv ausblenden, chatDiv und opponentDiv einblenden */
			signDiv.style.display = 'none';
			chatDiv.style.display = 'inline-block';
			opponentDiv.style.display = 'inline-block';
			addToChat('Welcome to MA-TSE-MON! - Type <code>/help</code> to see all commands!', infoColor);
			infoMessageDiv.innerHTML = '';
		} else {
			infoMessageDiv.innerHTML = 'Sign In unsuccessful! ._.';
		}
	});
	//ALREADY LOGGED-IN
	socket.on('alreadyLoggedIn', function(){
		infoMessageDiv.innerHTML = 'Du bist bereits woanders eingeloggt! Bitte logge dich dort zuerst aus. ^o^';
	});
	//GET MY DATA
	socket.on('getMyData', function(data){ //data is JSON
		if(data.username){
			chatDivInfoUsername.innerHTML = data.username;
		}
		if(data.exp){
			chatDivInfoExp.innerHTML = 'exp:'+data.exp;
		}
		//chatDivInfoLvl.innerHTML = 'lvl:'+data.lvl;
		if(data.guild){
			chatDivInfoGuild.innerHTML = 'guild:'+data.guild;
		}
		if(data.guildmaster){
			chatDivInfoGuildmaster.innerHTML = 'guildmaster:'+data.guildmaster;
		}
		if(data.infight){
			chatDivInfoInfight.innerHTML = 'infight:'+data.infight;
		}
		//IDEE: für lvl n braucht man INSGESAMT n^2 exp 1:1,2:4,20:400,30:900,50:2500,100:10.000 !
		if(data.exp){
			playerlvl = 1;
			expprogress = data.exp*25; //first level needs 4exp
			for(var i = 2; i <= 100; i++){
				if(data.exp >= Math.pow(i,2)){
					playerlvl = i;
					expprogress = (data.exp - Math.pow(i,2))/(Math.pow(i+1,2) - Math.pow(i,2))*100;
				}
			}
			if(data.exp >= 10000){
				expprogress = 100;
				document.getElementById('expBar').style.backgroundColor = 'purple';
			}
			if(parseInt(chatDivInfoLvl.innerHTML) < playerlvl){ //LVL UP
				addToChat('Level '+playerlvl+'! *Fireworks*', infoColor);
				document.getElementById('expBar').style.width = '100%';
				document.getElementById('expBar').style.backgroundColor = 'white';
				setTimeout(function(){
					document.getElementById('expBar').style.width = expprogress+'%';
					document.getElementById('expBar').style.backgroundColor = 'orange';
				},3000);
			} else {
				document.getElementById('expBar').style.width = expprogress+'%';
			}
			chatDivInfoLvl.innerHTML = playerlvl;
		}
	});
	
	//ADD TO CHAT
	socket.on('addToChat', function(data){
		if(data.color === 'info'){
			addToChat(data.message, infoColor);
		} else if(data.color === 'guild'){
			addToChat(data.message, guildColor);
		} else if(data.color === 'warning'){
			addToChat(data.message, warningColor);
		} else if(data.color === 'error'){
			addToChat(data.message, errorColor);
		} else {
			addToChat(data.message, normalColor);
		}
	});
	socket.on('addToInfoBox', function(data){
		infoMessageDiv.innerHTML = data.message;
	});
	//DEBUG (EVAL)
	socket.on('evalAnswer', function(data){
		console.log(data);
	});
	//WHISPER FAILURE
	socket.on('whisperFail', function(data){
		if(data.stupid){
			addToChat('Warum flüsterst du dir selbst? O_O', warningColor);
		} else {
			addToChat(data.to+' ist nicht online oder existiert nicht. :(', warningColor);
		}
	});
	//WHISPER FROM ME
	socket.on('whisperFromMe', function(data){
		addToChat(data.message, whisperColor);
	});
	//WHISPER FOR ME
	socket.on('whisperForMe', function(data){
		addToChat(data.message, whisperColor);
	});
	//GUILD INVITE
	socket.on('guildInvite', function(data){
		addToChat('You have been invited to join the guild '+data.guildname+'!', infoColor);
		//addToChat('Du wirst testhalber automatisiert dort aufgenommen - du hast leider keine Wahl.', infoColor);
		addToChat('Type <code>/yes</code> or <code>/no</code> in the chat!', infoColor);
		guildInvitation = data.guildname;
	});
	
	//OPPONENT INIT - INITIALISIERT OPPONENT-LIST
	socket.on('opponentInit', function(data){ //data is JSON
		if(data.clear){
		opponentDivList.innerHTML = '';
		}
		try{
			var sth = document.getElementById(data.username).style.color; //Lol: workaround
		}catch(err){
			opponentDivList.innerHTML += '<div id="'+data.username+'" class="possibleOpponent " style="border:1px solid black;margin:0px;padding:0px">'+data.username+' - elo: '+data.elo+'</div><br/>';
			addOnclickEvents(data.username); //onclick event hinzufuegen
		}
	});
	//READY - WIRD ZUR OPPONENT-LIST HINZUGEFÜGT
	socket.on('ready', function(data){ //data is JSON
		try{
			document.getElementById(data.username).innerHTML = data.username+' - elo: '+data.elo;
			var sth = document.getElementById(data.username).style.color;
		}catch(err){
			opponentDivList.innerHTML += '<div id="'+data.username+'" class="possibleOpponent " style="border:1px dashed black;margin:0px;padding:0px">'+data.username+' - elo: '+data.elo+'</div><br/>';
			addOnclickEvents(data.username); //onclick event hinzufuegen
		}
	});


	//BUSY - WIRD VON DER OPPONENT-LIST ENTFERNT
	socket.on('busy', function(data){ //data is JSON
		var elem = document.getElementById(data.username);
		if(elem != undefined){
			elem.parentNode.removeChild(elem); //hier wird ein error geschmissen wenn jemand disconnected, der nicht auf der opponent list sichtbar war - soweit bekannt, sollte vorerst kein problem darstellen, evtl try & catch?
		}
		//elem.style.display = 'none';
	});
						
	//GET CHALLENGED BY SOMEBODY
	socket.on('challenged', function(data){
		chooseDiv.style.display = 'inline-block';
		chooseDivConfirm.innerHTML = data.challengerUsername + ' asked you for a challenge - Will you agree?';
		chooseDiv.name = data.challengerUsername; //Der Name vom Herausforderer muss irgendwie gespeichert werden - Dieser Weg ist aber durchaus merkwürdig :D
console.log('chooseDiv.name is now '+chooseDiv.name); //Nur zum debuggen
	});
	//CHALLENGE-ANSWER - YOUR OPPONENT CHOSE YES OR NO
	socket.on('challengeAnswer', function(data){
		if(data.success){
console.log(data.opponentUsername+' agreed your challenge!'); //Nur zum debuggen
			//fightDiv einblenden, opponentDiv ausblenden
			fightDiv.style.display = 'inline-block';
			opponentDiv.style.display = 'none';
			infoMessageDiv.innerHTML = '';
		} else {
			infoMessageDiv.innerHTML = data.opponentUsername+' declined your challenge!';
		}
	});
	
	//FIGHT INIT - ALLE DATEN WERDEN ERST EINMAL INITIALISIERT
	socket.on('beginFight', function(data){
		//TODO SHOW YOUR TYPE AND ENEMY TYPE
		var myChar;
		var enemyChar;
		switch(data.type){
			case 'mystic': myChar = 'girl'; break;
			case 'holy': myChar = 'santa'; break;
			case 'science': myChar = 'robo'; break;
		}
		switch(data.enemyType){
			case 'mystic': enemyChar = 'girl'; break;
			case 'holy': enemyChar = 'santa'; break;
			case 'science': enemyChar = 'robo'; break;
		}
		loadFighter(myChar,enemyChar); //yannicks embedded function
		
		fightDivMyHp.style.backgroundColor = 'rgb(0,255,0)';
		fightDivEnemyHp.style.backgroundColor = 'rgb(0,255,0)';
		

		
		fightDivAttacksButton1.innerHTML = data.atk1;
		console.log(data.atk1Strong);
		if(data.atk1Strong != ''){
			fightDivAttacksButton1.style.backgroundColor = typeColor[data.atk1Strong];
			fightDivAttacksButton1.style.color = 'black';
		}
		fightDivAttacksButton2.innerHTML = data.atk2;
		if(data.atk2Strong != ''){
			fightDivAttacksButton2.style.backgroundColor = typeColor[data.atk2Strong];
			fightDivAttacksButton2.style.color = 'black';
		}
		fightDivAttacksButton3.innerHTML = data.atk3;
		if(data.atk3Strong != ''){
			fightDivAttacksButton3.style.backgroundColor = typeColor[data.atk3Strong];
			fightDivAttacksButton3.style.color = 'black';
		}
		
		addToChat('Fight starts!', infoColor);
		
		fightDivMyHp.innerHTML = data.myUsername;
		fightDivMyHp.style.width = '100%';
		fightDivEnemyHp.innerHTML = data.enemyUsername;
		fightDivEnemyHp.style.width = '100%';

		/*fightDivInfoMyUsername.innerHTML = data.myUsername;
		fightDivInfoEnemyUsername.innerHTML = data.enemyUsername;
		fightDivInfoMyGuild.innerHTML = data.myGuild;
		fightDivInfoEnemyGuild.innerHTML = data.enemyGuild;
		fightDivInfoMyLvl.innerHTML = data.myLvl;
		fightDivInfoEnemyLvl.innerHTML = data.enemyLvl;
		fightDivInfoMyHp.innerHTML = 100;
		fightDivInfoEnemyHp.innerHTML = 100;
		fightDivInfoFightId.innerHTML =  data.fightId;
		fightDivInfoTurn.innerHTML = data.turn;*/
	
		//oponentDiv ausblenden und fightDiv einblenden und fightDivAttacks ausblenden, falls nicht am Zug
		opponentDiv.style.display = 'none';
		fightDiv.style.display = 'inline-block';
		if(data.turn != data.myUsername){
			fightDivAttacks.style.visibility = 'hidden';
		} else {
			fightDivAttacks.style.visibility = 'visible';
		}
	});
	//END FIGHT
	socket.on('endFight', function(data){
		addToChat('Fight is over!', infoColor);
		audio7.play();
		//opponentDiv wird eingeblendet und fightDiv wird ausgeblendet
		setTimeout(function(){
			opponentDiv.style.display = 'inline-block';
			fightDiv.style.display = 'none';
		},2000);
	});
	
	//ME TOOK DAMAGE
	socket.on('takeDmg', function(data){
		if(data.myturn){
			fightDivAttacks.style.visibility = 'visible'; //Hier wird nicht die Technik von display:none/inline-block verwendet damit sich nicht alles verschiebt während des Zugwechsels!
		}
		if((data.newHp+'%') != fightDivMyHp.style.width){
			if(data.newHp < 0){
				data.newHp = 0;
			}
			fightDivMyHp.style.width = data.newHp+'%';
			var red = (100-data.newHp)*5;
			if(red > 255){
				red = 255;
			}
			var green = 255;
			if(data.newHp <= 50){
				green = data.newHp*5;
			}
			if(green<0){
				green=0;
			}
			var blue = 0;
			setTimeout(function(){
				fightDivMyHp.style.backgroundColor = "rgb("+Math.round(red)+","+Math.round(green)+","+Math.round(blue)+")";
				fightDivMyHp.style.border = "1px solid black";
				fightDivMyHp.style.color = "black";
			}, 200);
			fightDivMyHp.style.backgroundColor = "rgb(0,0,0)";
			fightDivMyHp.style.border = "1px solid white";
			fightDivMyHp.style.color = "white";
		}
	});
	//ENEMY TOOK DAMAGE
	socket.on('yourEnemyTookDmg', function(data){
		if(data.myturn){
			fightDivAttacks.style.visibility = 'visible'; //Hier wird nicht die Technik von display:none/inline-block verwendet damit sich nicht alles verschiebt während des Zugwechsels!
		}
		if((data.newHp+'%') != fightDivEnemyHp.style.width){
			if(data.newHp < 0){
				data.newHp = 0;
			}
			fightDivEnemyHp.style.width = data.newHp+'%';
			var red = (100-data.newHp)*5;
			if(red > 255){
				red = 255;
			}
			var green = 255;
			if(data.newHp <= 50){
				green = data.newHp*5;
			}
			if(green<0){
				green=0;
			}
			var blue = 0;
			setTimeout(function(){
				fightDivEnemyHp.style.backgroundColor = "rgb("+Math.round(red)+","+Math.round(green)+","+Math.round(blue)+")";
				fightDivEnemyHp.style.border = "1px solid black";
				fightDivEnemyHp.style.color = "black";
			}, 200);
			fightDivEnemyHp.style.backgroundColor = "rgb(0,0,0)";
			fightDivEnemyHp.style.border = "1px solid white";
			fightDivEnemyHp.style.color = "white";
		}
	});
	//EVENT-MESSAGES
	socket.on('eventMessage', function(data){
		if(data.message == 'CRIT'){
			containerDiv.style.background = "black";
			setTimeout(function(){
				containerDiv.style.background = "rgba(0,0,0,0)";
			}, 1000);
			//CRITSOUND
			audio8.play();
		} else if(data.message == 'MISS'){
			//MISSSOUND
		}
		document.getElementById('eventMessage').innerHTML = '<c style="font-size:2em;color:red;font-family:matsemonHeaderFont" >'+data.message+'</c>';
		setInterval(function(){
			//after 2 s
			document.getElementById('eventMessage').innerHTML = '';
		},2000);
	});
	//ATTACK HANDLING - DAMAGE
	socket.on('atkResponse', function(data){
		if(data.success){
			socket.emit('dealDamage', {enemy:enemyUsername,fightId:id});
			myTurn = false;
			myTurn.innerHTML = myTurn;
			infoMessageDiv.innerHTML = '';
		} else {
			infoMessageDiv.innerHTML = 'Server denied your attack! o~o';
		}
	});
	//BEST
	socket.on('sendBestData', function(res){
		//TODO your rank
		bestDiv.innerHTML = '';
		var cnt = 1;
		for(var key in res){
			bestDiv.innerHTML += cnt+'. with elo value '+res[key].elo+' is '+res[key].username+'<br>';
			cnt++;
		}
	});
	document.getElementById('showRanking').onclick = function(){
	console.log('GETBESTDATA!');
		socket.emit('getBestData',{});
	}
	/********************************************** SERVER-RESPONSE END **********************************************/
	/* ICH HABE ALLES AN CODE, DAS NUR ZUM DEBUGGEN VORHANDEN IST (DARUNTER GANZE EVENTS), 
	GANZ LINKSBUENDIG GESCHRIEBEN, DAMIT MAN ES SPÄTER SCHNELL SIEHT UND WEGMACHEN KANN */
	
	audio1.play();

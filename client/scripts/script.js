jQuery(function($){
	var socket = io.connect();
	var $nickForm = $('#setNick');
	var $nickError = $('#nickError');  
	var $nickBox = $('#nickname');
	var $users = $('#users');
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $('#chat');
	var $fightcontrol = $('#fightcontrol');
	var $fightdisplay = $('#fightdisplay');
	var $showFight = $('#showFight');
	var $showUsers = $('#showUsers');
	var userlist = [];
	var opponent = '';
	var username = '';
	var myTurn = false;
	var attacklist = ['attack1','attack2','attack3','attack4'];
	
	$nickForm.submit(function(e){
		e.preventDefault(); 
		$username = $nickBox.val();
		socket.emit('new user', $nickBox.val(), function(data){
			if(data){
			
				$('#nickWrap').hide();

				$('#contentWrap').show();
				$showFight.hide();
			}else{
				
				$nickError.html('That username is already taken, try again');
			}
			
			
		});
		$nickBox.val('');
	});
	$fightcontrol.submit(function(e){
		e.preventDefault();

		var btn = $(this).find("input[type=submit]:focus");
		if($myTurn){
		socket.emit('attack',btn.val(),$opponent,$username);
		$myTurn=false;
		}else{
			alert('Not your turn!');
		}
	});
	
	socket.on('new fightstats', function(data){
		
		var html ='Your HP: '+ data.hp+' / Enemy HP: '+data.ehp;
		$myTurn = data.myTurn;
			
		
		
		$fightdisplay.html(html);
	});

	socket.on('won',function(){
		alert('you won');
		$showUsers.show();
		$showFight.hide();
		$opponent='';
	});
		socket.on('lost',function(){
		alert('you lost');
		$showUsers.show();
		$showFight.hide();
		$opponent='';
	});


	socket.on('get challange', function(data){
		if (confirm(data+" has challanged you to a Fight ") == true) {
					$opponent = data;
					socket.emit('confirm challange',$opponent,$username);
					$showUsers.hide();
					$showFight.show();
					$myTurn = true;
					//load attacklist
					//set button text
				} else {
					alert('bouk bouk bouk you chicken');
				}
		
	});

		socket.on('start fight', function(data){		
			$opponent = data;
			$showUsers.hide();
			$showFight.show();
			$myTurn = false;
				//load attacklist
				//set button text

	});
	
	
	socket.on('usernames', function(data){
		$userlist = data;
	 $('#users').empty();
		for(i = 0; i < data.length; i++){
		var li = $('<li></li>');
		
		var trainer = $('<span></span>').append(data[i]).click(function(){
		var row = $(this).parent().parent().children().index($(this).parent());

				if (confirm("Fight "+$userlist[row]+"!") == true) {
				
					socket.emit('send challange',$username,$userlist[row]);
					$opponent = $userlist[row];
				} else {
					
				}
				//document.getElementById("demo").innerHTML = txt;
			
			
			
			
		}).appendTo(li);
	
		$('#users').append(li);
		}
	});
	
	
	$messageForm.submit(function(e){
		e.preventDefault();
		socket.emit('send message',$messageBox.val());
		$messageBox.val('');
	
	});
	
	socket.on('new message',  function(data){
	$chat.append('<span class="msgline"><b>'+data.nick+': </b>'+data.msg + '</span><br/>');
	});
	socket.on('whisper',  function(data){
	$chat.append('<span class="whisper"><b>'+data.nick+': </b>'+data.msg + '</span><br/>');
	});
	
	
	
	});
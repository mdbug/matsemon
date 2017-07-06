



function shoot(){
		id.addClass(troR);
		tro.removeClass(idR);
		setTimeout(function() { tro.addClass(idR); }, 600);
        setTimeout(function() { id.removeClass(troR); }, 600);
		
		setTimeout(function() { $('.projectile').addClass('fireball');}, 200);
		setTimeout(function() { $('.fireball').removeClass('projectile');}, 200);
		

        setTimeout(function() { $('.fireball').css('filter','hue-rotate('+90*selfType+'deg)');}, 200);

		
		setTimeout(function() { $('.fireball').css("transform","scaleX(-1)"); }, 200);
		setTimeout(function() { $('.fireball').addClass('smoke'); }, 850);
        setTimeout(function() { $('.smoke').removeClass('fireball'); }, 850);
		setTimeout(function() { $('.smoke').addClass('projectile'); }, 1200);
        setTimeout(function() { $('.projectile').removeClass('smoke'); }, 1200);
	
		setTimeout(function() { idO.addClass(deadOR);}, 800);
		setTimeout(function() { deadO.removeClass(idOR);}, 800);
		setTimeout(function() { deadO.addClass(idOR); }, 1200);
        setTimeout(function() { idO.removeClass(deadOR); }, 1200);
		

}


function getShot(){
	
	idO.addClass(troOR);
		troO.css("transform", "scaleX(-1)");
		troO.removeClass(idOR);
		setTimeout(function() { troO.addClass(idOR); }, 600);		
        setTimeout(function() { idO.removeClass(troOR); }, 600);
		
		
		setTimeout(function() { $('.projectile').addClass('fireball');}, 200);
		
	
		setTimeout(function() { $('.fireball').css('filter','hue-rotate('+90*oppoType+'deg)');}, 200);

		//setTimeout(function() { $('.fireballOpponent').css('filter','hue-rotate(180deg)');}, 200);
		
		setTimeout(function() { $('.fireball').removeClass('projectile');}, 200);
		setTimeout(function() { $('.fireball').css("transform","scaleX(1)"); }, 200);
		setTimeout(function() { $('.fireball').css("animation","fireballOpponentAnim steps(6) 0.7s infinite"); }, 200);
		setTimeout(function() { $('.fireball').css("animation",""); }, 850);
		setTimeout(function() { $('.fireballt').css("transform",""); }, 850);
			
		setTimeout(function() { $('.fireball').addClass('smoke'); }, 850);
        setTimeout(function() { $('.smoke').removeClass('fireball'); }, 850);
		setTimeout(function() { $('.smoke').css("left","0%"); }, 850);
		setTimeout(function() { $('.smoke').css("left","60%"); }, 1200);
		setTimeout(function() { $('.smoke').addClass('projectile'); }, 1200);
        setTimeout(function() { $('.projectile').removeClass('smoke'); }, 1200);
		
		
	
		
		
		setTimeout(function() { id.addClass(deadR);}, 800);
		setTimeout(function() { dead.css("transform", "scaleX(-1)");}, 800);	
		setTimeout(function() { dead.css("transform", "");}, 1200);	
		setTimeout(function() { dead.removeClass(idR);}, 800);
		
		setTimeout(function() { dead.css("transform", "");}, 1200);	
		setTimeout(function() { dead.addClass(idR); }, 1200);
        setTimeout(function() { id.removeClass(deadR); }, 1200);
	

}


function slash(){
	
id.addClass(atkR);
		atk.removeClass(idR);
		$('.fighter').addClass('moveLeft');
		
		setTimeout(function() { $('.projectile').addClass('blood'); }, 400);
		setTimeout(function() { atk.addClass(idR); }, 600);
        setTimeout(function() { id.removeClass(atkR); }, 600);
		setTimeout(function() { $('.fighter').removeClass('moveLeft');; }, 600);
        setTimeout(function() { $('.projectile').removeClass('blood'); }, 700);
				
		setTimeout(function() { idO.addClass(deadOR);}, 500);
		setTimeout(function() { deadO.removeClass(idOR);}, 500);
		setTimeout(function() { deadO.addClass(idOR); }, 1000);
        setTimeout(function() { idO.removeClass(deadOR); }, 1000);
		

}


function getSlashed(){
	
		idO.addClass(atkOR);	
		atkO.removeClass(idOR);
		
		$('.opponent').addClass('moveRight');
		setTimeout(function() { $('.projectile').addClass('blood'); }, 400);
		setTimeout(function() { $('.blood').css("left", "0%");}, 400);	
		
		
		setTimeout(function() { atkO.addClass(idOR); }, 600);
        setTimeout(function() { idO.removeClass(atkOR); }, 600);
		setTimeout(function() { $('.opponent').removeClass('moveRight');; }, 600);
		
		setTimeout(function() { $('.blood').css("left", "");}, 700);	
		setTimeout(function() { $('.projectile').removeClass('blood'); }, 700);
		
		
		setTimeout(function() { id.addClass(deadR);}, 500);
		setTimeout(function() { dead.removeClass(idR);}, 500);
		setTimeout(function() { dead.css("transform", "scaleX(-1)");}, 500);	
		setTimeout(function() { dead.addClass(idR); }, 1000);
		setTimeout(function() { dead.css("transform", "");}, 1000);
        setTimeout(function() { id.removeClass(deadR); }, 1000);		
		setTimeout(function() { dead.css("transform", "1");}, 1000);	
	

	


	
}

function getHealed(){
	
		setTimeout(function() { $('.projectile').addClass('heal');}, 200);	
        setTimeout(function() { $('.heal').css("transform","scaleX(1)");}, 200);	
        setTimeout(function() { $('.heal').css('filter','hue-rotate(0deg)');}, 200);	
		setTimeout(function() { $('.heal').css("animation","healOpponentAnim steps(10) 3.0s infinite"); }, 200);		
		setTimeout(function() { $('.brojectile').addClass('opponentFlash'); }, 1500);
		//setTimeout(function() { $('.heal').addClass('smoke'); }, 850);
		setTimeout(function() { $('.heal').css("animation",""); }, 3000);	
        setTimeout(function() { $('.projectile').removeClass('heal'); }, 3000);
		setTimeout(function() { $('.brojectile').removeClass('opponentFlash'); }, 2500);
		//setTimeout(function() { $('.smoke').addClass('projectile'); }, 1200);
        //setTimeout(function() { $('.projectile').removeClass('smoke'); }, 1200);
		
		

}

function oppoHealed(){
	
		setTimeout(function() { $('.projectile').addClass('heal');}, 200);	
		setTimeout(function() { $('.heal').css("transform","scaleX(-1)");}, 200);	
        setTimeout(function() { $('.heal').css('filter','hue-rotate(0deg)');}, 200);	
		setTimeout(function() { $('.heal').css("animation","healAnim steps(10) 3.0s infinite"); }, 200);		
		setTimeout(function() { $('.brojectile').addClass('flash'); }, 1500);
		//setTimeout(function() { $('.heal').addClass('smoke'); }, 850);
		setTimeout(function() { $('.heal').css("animation",""); }, 3000);	
        setTimeout(function() { $('.projectile').removeClass('heal'); }, 3000);
		setTimeout(function() { $('.brojectile').removeClass('flash'); }, 2500);
		//setTimeout(function() { $('.smoke').addClass('projectile'); }, 1200);
        //setTimeout(function() { $('.projectile').removeClass('smoke'); }, 1200);

}


function loose(){
	$('.stats').hide();
	$('.fightWindow').hide();
	$('.loser').show();
}


$(document).on('keydown', function(e) {
	
    if (e.keyCode === 68) { // 68 is the letter D on the keyboard
		shoot();

	
		
	
    }
	if (e.keyCode === 69) { // 69 is the letter E on the keyboard
		
	getShot();
    }
	
	
	    if (e.keyCode === 70) { // 70 is the letter F on the keyboard
		slash();
    }
	
	if (e.keyCode === 71) { // 71 is the letter G on the keyboard
		//getSlashed();
		getHealed();
    }
	if (e.keyCode === 72) { // 72 is the letter H on the keyboard
	
	oppoHealed();
    }
	
	
	
});

function controlAnim(atkName, who){

	if(who=='you'){
		if(atkName=='Death Grip'||atkName=='Rape'||atkName=='Jesus Punch'||atkName=='Ghoul Explosion'||atkName=='Darkness'||atkName=='Epsilon-Delta-Crit'||atkName=='Sumzing sumzing'){
			slash();
		}
		if(atkName=='Doom'||atkName=='Throw Bible'||atkName=='Holy Pain'||atkName=='Exorcism'||atkName=='Zero-Division'||atkName=='Analysis 2'||atkName=='Horners Method'){
			shoot();
		}
		if(atkName=='Soul Harvest'||atkName=='Heal'||atkName=='Summon Satan'||atkName=='Gauß'){
			getHealed();
		}
		
	}
	if(who=='oppo'){
		if(atkName=='Death Grip'||atkName=='Rape'||atkName=='Jesus Punch'||atkName=='Ghoul Explosion'||atkName=='Darkness'||atkName=='Epsilon-Delta-Crit'||atkName=='Sumzing sumzing'){
			getSlashed();
		}
		if(atkName=='Doom'||atkName=='Throw Bible'||atkName=='Holy Pain'||atkName=='Exorcism'||atkName=='Zero-Division'||atkName=='Analysis 2'||atkName=='Horners Method'){
			getShot();
		}
		if(atkName=='Soul Harvest'||atkName=='Heal'||atkName=='Summon Satan'||atkName=='Gauß'){
			oppoHealed();
		}
	}
	/*
	
	
	
	
	

	
	//science attacks
	
	
	
	
	
	
	
	*/
}

function loadFighter(fighter, opponent){
	
	
var  ratio =($( window ).width()*0.8)/1600;
 $('.fightWindow').css("zoom",ratio);


	var you = fighter;
	var other  = opponent;
$('.fightWindow').show();
$('.idle').addClass(you+'Idle');
$('.'+you+'Idle').removeClass('idle');
$('.opponentIdle').addClass(other+'IdleOpponent');
$('.'+other+'IdleOpponent').removeClass('opponentIdle');

/*window.oppoType = 0;	
window.selfType = 0;*/

if(you=="robo"){
window.selfType = 2;	
}
if(you=="girl"){
window.selfType = 1;
}
if(you=="santa"){
window.selfType = 0;
}

if(other=="robo"){
window.oppoType = 2;	
}
if(other=="girl"){
window.oppoType = 1;
}
if(other=="santa"){
window.oppoType = 0;
}


window.id = $('.'+you+'Idle');
window.idR = ''+you+'Idle';
window.tro = $('.'+you+'Throw');
window.troR = ''+you+'Throw';
window.dead = $('.'+you+'Dead');
window.deadR = ''+you+'Dead';
window.atk = $('.'+you+'Attack');
window.atkR = ''+you+'Attack';

window.idO = $('.'+other+'IdleOpponent');
window.idOR = ''+other+'IdleOpponent';
window.troO = $('.'+other+'ThrowOpponent');
window.troOR = ''+other+'ThrowOpponent';
window.deadO = $('.'+other+'DeadOpponent');
window.deadOR = ''+other+'DeadOpponent';
window.atkO = $('.'+other+'AttackOpponent');
window.atkOR = ''+other+'AttackOpponent';


	
	//atkO.css(tempatk);
	atkO.css("animation",""+other+"AttackAnimOpponent steps(10) 0.5s infinite");
	//atk.css("animation",""+you+"AttackAnim steps(10) 0.5s infinite; "); 
	 
	 id.css("transform","scaleX(1)");
	 tro.css("transform","scaleX(1)");
	 dead.css("transform","scaleX(1)");
	 atk.css("transform","scaleX(1)");
	 
	 idO.css("transform","scaleX(-1)");
	 troO.css("transform","scaleX(-1)");
	 deadO.css("transform","scaleX(-1)");
	 atkO.css("transform","scaleX(-1)");



	};


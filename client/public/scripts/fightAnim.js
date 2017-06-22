



function shoot(){
		id.addClass(troR);
		tro.removeClass(idR);
		setTimeout(function() { tro.addClass(idR); }, 600);
        setTimeout(function() { id.removeClass(troR); }, 600);
		
		setTimeout(function() { $('.projectile').addClass('fireball');}, 200);
		setTimeout(function() { $('.fireball').removeClass('projectile');}, 200);
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
		setTimeout(function() { $('.fireball').removeClass('projectile');}, 200);
		setTimeout(function() { $('.fireball').css("transform","scaleX(1)"); }, 200);
		setTimeout(function() { $('.fireball').css("animation","fireballOpponentAnim steps(6) 0.7s infinite"); }, 200);
		setTimeout(function() { $('.fireball').css("animation",""); }, 850);
		setTimeout(function() { $('.fireball').css("transform",""); }, 850);
			
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
		setTimeout(function() { $('.projectile').addClass('blood'); }, 400);
		setTimeout(function() { atk.addClass(idR); }, 600);
        setTimeout(function() { id.removeClass(atkR); }, 600);
        setTimeout(function() { $('.projectile').removeClass('blood'); }, 700);
				
		setTimeout(function() { idO.addClass(deadOR);}, 500);
		setTimeout(function() { deadO.removeClass(idOR);}, 500);
		setTimeout(function() { deadO.addClass(idOR); }, 1000);
        setTimeout(function() { idO.removeClass(deadOR); }, 1000);
		

}


function getSlashed(){

		idO.addClass(atkOR);	
		atkO.removeClass(idOR);
		
		setTimeout(function() { $('.projectile').addClass('blood'); }, 400);
		setTimeout(function() { $('.blood').css("left", "0%");}, 400);	
		
		
		setTimeout(function() { atkO.addClass(idOR); }, 600);
        setTimeout(function() { idO.removeClass(atkOR); }, 600);
		
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
		getSlashed();
    }
	if (e.keyCode === 72) { // 72 is the letter H on the keyboard

			
loose();
    }
	
	
	
});
function loadFighter(fighter, opponent){

	var you = fighter;
	var other  = opponent;
	
$('.idle').addClass(you+'Idle');
$('.'+you+'Idle').removeClass('idle');
$('.opponentIdle').addClass(other+'Idle');
$('.'+other+'Idle').removeClass('opponentIdle');


	
window.id = $('.'+you+'Idle');
window.idR = ''+you+'Idle';
window.tro = $('.'+you+'Throw');
window.troR = ''+you+'Throw';
window.dead = $('.'+you+'Dead');
window.deadR = ''+you+'Dead';
window.atk = $('.'+you+'Attack');
window.atkR = ''+you+'Attack';

window.idO = $('.'+other+'Idle');
window.idOR = ''+other+'Idle';
window.troO = $('.'+other+'Throw');
window.troOR = ''+other+'Throw';
window.deadO = $('.'+other+'Dead');
window.deadOR = ''+other+'Dead';
window.atkO = $('.'+other+'Attack');
window.atkOR = ''+other+'Attack';

var tempatk= atkO.css('animation')+" , animation: moveLeft steps(10) 0.7s infinite";
	
	//atkO.css(tempatk);
//	atk.css("animation", atk.css('animation')+" , animation: moveRight steps(10) 0.7s infinite");
	 
	 
	 id.css("transform","scaleX(1)");
	 tro.css("transform","scaleX(1)");
	 dead.css("transform","scaleX(1)");
	 atk.css("transform","scaleX(1)");
	 
	 idO.css("transform","scaleX(-1)");
	 troO.css("transform","scaleX(-1)");
	 deadO.css("transform","scaleX(-1)");
	 atkO.css("transform","scaleX(-1)");



	};


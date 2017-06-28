//Elo-Zahl-Modul - Berechnet mithilfe der bisherigen Elo-Zahlen zweier Spieler und dem Spielergebnis die neuen Punktstaende
//exports. dient zum exportieren fuer den Zugriff von Node.js
exports.elo = function (R_A, R_B, S_A, S_B){
	//var R_A; //bisherige Elo-Zahl von Spieler A 
	//var R_B; //bisherige Elo-Zahl von Spieler B
	//var S_A; //Sieg:1, Unentschieden:0.5, Niederlage:0
	//var S_B; //Sieg:1, Unentschieden:0.5, Niederlage:0
	var k = 20; //Gewichtung
	var E_A = 1/(1 + Math.pow(10, (R_B - R_A)/400)); //Erwartungswert Spieler A
	//var E_B = 1/(1 + Math.pow(10, (R_A - R_B)/400)); //Erwartungswert Spieler B
	var E_B = 1 - E_A;
	//E_A + E_B = 1
	var delta = Math.round(k * (S_A - E_A)); //Wir beschränken uns auf einen Rechenvorgang und runden zusaetzlich
	var R_A_new = R_A + delta;
	//var R_A_new = R_A + k * (S_A - E_A);
	var R_B_new = R_B - delta;
	//var R_B_new = R_B + k * (S_B - E_B);
	return {R_A : R_A_new, R_B : R_B_new, R_Delta: R_A_new - R_A}; //JSON-Objekt mit neuen Elo-Zahlen wird zurueckgegeben
}

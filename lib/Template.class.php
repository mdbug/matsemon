<?php

class Template{

private $arr = []; //array-attribut, in das 
private $nav = true;

function assign(string $key, $value){ //funktion, belegt array-attribut assoziativ mit dem inhalt, der in den jeweiligen platzhalter (key) eingefügt werden soll
	if($key === 'nav'){
		if($value === false){
			$this->nav = false;
		} else if ($value === true){
			$this->arr[$key] = '';
			return;
		}
	} 
	$this->arr[$key] = $value;
}
function display(string $datei){
	$str = file_get_contents($datei); //liest datei in einem string ein
	foreach ($this->arr as $key => $value){ //durchläuft alle schlüssel-werte-paare des array-attributes des Template-objektes
		if($this->nav === false){
			$str = str_replace('<nav>', '<!--', $str);
			$str = str_replace('</nav>', '-->', $str);
		}
		$str = str_replace('{$' . $key . '}' , $value, $str); //ersetzt mit str_replace(?,?,?) alle platzhalter mit dem wert des platzhalters (key) im angegebenen string (datei)
	}
		
	echo $str; //zeigt fertige datei an im browser
}

}
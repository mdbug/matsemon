//different effects for HTML DOM-elements

var glow = function(idOrClass){
	try{
		var element = document.getElementById(idOrClass);
		element.style.backgroundColor = 'green';
		//TODO
	}catch(err){
		var elements = document.getElementsByClass(idOrClass);
		for(var key in elements){
			elements[key].style.backgroundColor = 'green';
			//TODO
		}
	}
}
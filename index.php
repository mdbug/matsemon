<?php
echo $_COOKIE['on'];



if(isset($_SESSION['logged_in']) || isset($_COOKIE['on'])){ //falls ueber Cookie oder Session eingeloggt -> lobby.php
	header('Location: lobby.php');
}{										
	header('Location: login.php'); //Sonst: login.php
}


?>
<?php
if(isset($_POST['username']) === true && true === isset($_POST['password'])){

try{
	echo isset($_POST['username']);#test
	echo isset($_POST['password']);#test
	print_r($_GET);#test
	print_r($_POST);#test

	$username = filter_input(INPUT_POST, 'username', FILTER_DEFAULT); //usernames sollen/muessen einzigartig sein
	$password = filter_input(INPUT_POST, 'password', FILTER_DEFAULT);
		$hash = password_hash($password, PASSWORD_BCRYPT);
	
	
	$pdo = new PDO('mysql:dbname=matsemon;host=localhost', 'root', '');
	$stmt = $pdo->prepare("INSERT INTO user (Benutzername, Passwort, Note) VALUES (:benutzername, :passwort, :note)");
	$stmt->bindParam(':benutzername', $username);
	$stmt->bindParam(':passwort', $hash);

	$register = $stmt->execute();
	
	if($register){
	echo' hat geklappt';
	#header('Location: ../login.php');
	} else {
	echo 'hat nicht geklappt';
	}
} catch (Exception $e){
	die($e->getMessage());
} 

} else {
	session_start();
	$_SESSION['err'] = '<p><em>Kein Name und/oder Passwort!</em></p>';
	exit("stop");
}
?>
<?php
	$username = filter_input(INPUT_POST, 'username', FILTER_DEFAULT);
	$password = filter_input(INPUT_POST, 'password', FILTER_DEFAULT);
	$pdo = new PDO('mysql:dbname=matsemon;host=localhost', 'root', '');
	$stmt = $pdo->prepare('SELECT password FROM players WHERE username = :username');
	$stmt->bindParam(':username', $username);
	$stmt->execute();
	while($row = $stmt->fetch()){
		$correct = password_verify($password, $row['Passwort']);
	}
	if($correct){
		echo 'Passwort richtig.';
		if(setcookie('username', $username, time()+60*60*24*30, '/')){
			echo 'Cookie hingelegt.';
		} else {
			echo 'Cookie fallen gelassen.';
		}
		if(session_start()){
			$_SESSION['logged_in'] = 'true';
			echo 'Session gestartet.';
		} else {
			echo 'Session nicht gestartet.';
		}
		header('Location: ../lobby.php');
	}else{
		echo 'Passwort falsch.';
	}


?>
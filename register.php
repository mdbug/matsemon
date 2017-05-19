<?php
require('lib/Template.class.php');

session_start();

$onl = '';
if(isset($_COOKIE['username'])){
	$onl = '<a href="lobby.php">Du bist bereits eingeloggt, '.$_COOKIE['username'].'</a>';
}


$tpl = new Template();
$tpl->assign('title', 'register');
$tpl->assign('nav', true);
$tpl->assign('body', '

<form action="./lib/register_post.php" method="POST">
	<div class="form-group">
		<label for="username">Username</label>
		<input type="text" class="form-control" name="username" required></input>
	</div>
	<div class="form-group">
		<label for="password">Password</label>
		<input type="password" class="form-control" name="password" required></input>
	</div>
			
	<input type="submit" class="btn btnX" name="login" value="Submit"></input>
		
</form>

		<br/>
		<a href="login.php">Login</a>

		<br/>'.$onl.'
');
$tpl->display('templates/template.html');
?>

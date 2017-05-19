<?php
require('lib/Template.class.php');
if(isset($_COOKIE['username']) || isset($_SESSION['logged_in'])){
	header('Location: lobby.php');
}

$tpl = new Template();
$tpl->assign('title', 'login');
$tpl->assign('nav', false); //false -> nav wird auskommentiert; 'text' -> text wird anstelle von {$nav} eingefuegt; true: nav bleibt
$tpl->assign('body',

'<form action="lib/login_post.php" method="POST">
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
<a href="register.php">Register</a>

');
$tpl->display('templates/template.html');
?>
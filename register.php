<?php
require('lib/Template.class.php');

session_start();

$onl = '';
if(isset($_COOKIE['username'])){
	$onl = '<a href="lobby.php">Du bist bereits eingeloggt, '.$_COOKIE['username'].'</a>';
}


$tpl = new Template();
$tpl->assign('title', 'register');
$tpl->assign('body',

/*     '<form action="./lib/register_post.php?<?php echo "var=12"; ?>" method="POST"> */

        '<form action="./lib/register_post.php" method="POST">
			<input type="text" name="username"></input>
			<input type="password" name="password"></input>
			<select name="note">
				<option value="1" selected="selected">sehr gut</option>
				<option value="2">gut</option>
				<option value="3">befriedigend</option>
				<option value="4">ausreichend</option>
				<option value="5">mangelhaft</option>
				<option value="6">ungenügend</option>
			</select>
			<input type="submit" id="btn" value="Absenden"></input>
		</form>
		<div id="output"></div>
		<button type="button">Clicky! Clicky!</button>
		<br/>
		<a href="login.php">Login</a>
		<script src="scripts/register.js"></script>
		'.$err.'<br/>'.$onl);
$tpl->display('templates/template.html');
?>

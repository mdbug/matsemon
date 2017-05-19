<?php
session_start();
#require('lib/Student.class.php');
require('lib/Template.class.php');
$str='';
if(isset($_SESSION['student'])){ $str.= 'session (student) active : '.$_SESSION['student'].'<br/>';}

if(isset($_SESSION['logged_in'])){ $str.= 'session active : '.$_SESSION['logged_in'].'<br/>';}
if(isset($_COOKIE['on'])){ $str.= 'cookie active : '.$_COOKIE['on'].'<br/>';}
$tpl = new Template();
$tpl->assign('title', 'home');
$tpl->assign('body',
		$str.
		'<a href="logout.php">LOGOUT</a>'
		);
$tpl->display('templates/beispiel.tpl.html');
?>
<?php
session_start();
require('lib/Template.class.php');

$tpl = new Template();
$tpl->assign('title', 'lobby');
$tpl->assign('nav', true);
$tpl->assign('body', '

');
$tpl->display('templates/template.html');
?>
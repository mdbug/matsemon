<?php
session_start();
require('lib/Template.class.php');

$tpl = new Template();
$tpl->assign('title', 'home');
$tpl->assign('nav', true);
$tpl->assign('body', '

		
		<div id="canvas">
		
		</div>
		
		
		
		
		
		
		
		
		
		

		
		
		
		
');
			
$tpl->display('templates/template.html');
?>
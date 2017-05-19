<?php
session_start();
require('lib/Template.class.php');

$tpl = new Template();
$tpl->assign('title', 'home');
$tpl->assign('nav', true);
$tpl->assign('body', '

		
		<div id="canvas" style="background-color:grey;border:2px solid black;height:250px;width:250px">
		
		</div>
		
		
		
		
		
		
		
		
		
		

		
		
		
		
');
			
$tpl->display('templates/template.html');
?>
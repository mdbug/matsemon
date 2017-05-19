<?php
session_destroy(); //Session wird zerstoert
setcookie("username", "", time() - 1000000, '/'); //Cookie-Zeit ist abgelaufen
header('Location: login.php'); //Weiterleitung zur login.php
?>
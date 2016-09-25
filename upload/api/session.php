<?php
/**
 *  
 *  return a serial number for each guest
 *  users will upload images to this session
 *  if user is logged in then get all uploads from database (TODO)
 *  
 */
require __DIR__ . '/autoload.php';

use Rhumsaa\Uuid\Uuid;
use Rhumsaa\Uuid\Exception\UnsatisfiedDependencyException;

if(isset($_GET['reset']) == 1) {
	unset($_SESSION['uuid']);	
}

if(!isset($_SESSION['uuid'])) {
	$_SESSION['uuid'] = generate_session()->toString();
}

$result = [];
$result['status'] = true;
$result['uuid'] = $_SESSION['uuid'];

header('Content-Type: application/json');
echo json_encode($result);


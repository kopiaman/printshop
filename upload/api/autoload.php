<?php

if(function_exists('xdebug_disable')) {
	xdebug_disable();
}

//error_reporting(E_ERROR | E_PARSE);
require __DIR__ . '/../bootstrap.php';
session_start();
/**
 *  
 *  Enable CORS if you want to access
 *  it via something like phonegap
 *  
 */
function enable_cors() {

    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: ".$_SERVER['HTTP_ORIGIN']."");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Request-Method: *');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }

}
function slugify($text) { 
    // replace non letter or digits by -
    $text = preg_replace('~[^\\pL\d]+~u', '-', $text);
    $text = trim($text, '-');
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text); // transliterate
    $text = strtolower($text);// lowercase
    $text = preg_replace('~[^-\w]+~', '', $text);// remove unwanted characters

    if (empty($text))
        return 'n-a';
    return $text;
}
enable_cors();
@session_start();


use Rhumsaa\Uuid\Uuid;
use Rhumsaa\Uuid\Exception\UnsatisfiedDependencyException;


function generate_session() {
	try {
		$uuid1 = Uuid::uuid1();
	} catch (UnsatisfiedDependencyException $e) {
		echo 'Caught exception: ' . $e->getMessage() . "\n";
	}
	return $uuid1;
}

if(!isset($_SESSION['uuid'])) {
	$_SESSION['uuid'] = generate_session()->toString();
}


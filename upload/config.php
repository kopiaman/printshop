<?php

/**
 * Base URL (optional).
 *
 * If you are experiencing issues with different site domains,
 * uncomment the Base URL statement below (remove the leading hash sign)
 *
 * You might also want to force users to use a given domain.
 * See the .htaccess file for more information.
 *
 * Examples:
 *   define("BASE_URL", "/"); //root e.g. http://www.example.com/
 *   define("BASE_URL", "/tshirt/"); //folder e.g. http://www.example.com/tshirt
 *
 */
define("BASE_URL", "/");

//no need to change this unless you want to change the default paths
define("ADMIN_URL", BASE_URL . "admin");
define("API_URL", BASE_URL . "api");

/**
 *  Database information (optional).
 *  
 *  By default it uses sqlite.
 *  
 *  If you want to switch over to mysql, first create a database
 *  using your provider, phpmyadmin or command line.
 *  Then in the section below uncomment the mysql section
 *  and enter your connection details  
 *  
 */
function get_database_connection() {
	$settings = array(
		'driver'    => 'sqlite',
		'database' => __DIR__.'/data/database/production.sqlite',
		'prefix'    => ''
	);

	/*
	//uncomment for mysql
	$settings = array(
		'driver' => 'mysql',
		'host' => '127.0.0.1',
		'database' => '',
		'username' => '',
		'password' => '',
		'collation' => 'utf8_general_ci',
		'charset' => 'utf8',
		'prefix' => ''
	);
	*/
	return $settings;
}



//error management
if(isset($_GET['display_errors']) && $_GET['display_errors'] == 'on') {
	$_SESSION['display_errors'] = $_GET['display_errors'];
}

if(isset($_GET['display_errors']) && $_GET['display_errors'] == 'off') {
	$_SESSION['display_errors'] = $_GET['display_errors'];
}

ini_set('display_errors', 0);
error_reporting(0);
if(isset($_SESSION['display_errors']) && $_SESSION['display_errors'] == 'on') {
	ini_set('display_errors', 1);
	error_reporting(E_ALL | E_STRICT);
}

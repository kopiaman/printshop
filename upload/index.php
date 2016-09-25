<?php

/* Make sure PHP 5.4 is running */
if(version_compare(PHP_VERSION, '5.4.0') < 0) {
	die("ERROR - Please make sure you're running PHP 5.4.0 or higher\n");
}

// Check extension: sqlite
if(!class_exists('SQLite3')) {
	die("ERROR - SQLite 3 PHP extension missing\n");
}

// Check extension: PDO
if (! extension_loaded('pdo_sqlite') && ! extension_loaded('pdo_mysql')) {
    die('ERROR - PHP extension required: pdo_sqlite or pdo_mysql');
}

// Check extension: finfo
if (!function_exists('finfo_open')) {
	die("ERROR - PHP fileinfo extension missing\n");
}

/* redirects to the app (stored in dist), you can change the directory if you like */
header('Location: dist/');

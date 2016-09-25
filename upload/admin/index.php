<?php

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . "/functions.php";
if (function_exists('xdebug_disable')) {
	xdebug_disable();
}

#echo $_SERVER['REQUEST_URI'];die();
// Short tags must be enabled
if (!ini_get('short_open_tag')) {
	die("ERROR - Please make sure you have short tags enabled e.g. 'short_open_tag = On'\n");
}


session_start();
if(!isset($_SESSION['logged_in'])) {
	$_SESSION['logged_in'] = false;
}

include __DIR__ . "/controllers/BaseController.php";
include __DIR__ . "/controllers/AuthController.php";
include __DIR__ . "/controllers/DashboardController.php";
include __DIR__ . "/controllers/CategoriesController.php";
include __DIR__ . "/controllers/VariantsController.php";
include __DIR__ . "/controllers/ProductsController.php";
include __DIR__ . "/controllers/OrdersController.php";
include __DIR__ . "/controllers/PricingController.php";
include __DIR__ . "/controllers/SettingsController.php";
include __DIR__ . "/controllers/PaymentMethodsController.php";

//include the routes we need
include __DIR__ . "/routes.php";

//clear the flash messages
unset($_SESSION['success']);
unset($_SESSION['error']);
unset($_SESSION['vars']);

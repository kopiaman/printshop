<?php

$app = new \Slim\Slim();
#$app->config('debug', false);

//check if logged in - if not just redirect
$settings = include __DIR__ . '/../data/settings.php';

function auth_middleware() {
	if (!$_SESSION['logged_in']) {
		$app = \Slim\Slim::getInstance();
		$app->redirect(site_url('auth'));
	}
}

###AUTH###
$app->get('/auth', 'AuthController:index');
$app->post('/auth/login', 'AuthController:login');
	
$app->group('', 'auth_middleware', function () use ($app) {

	$app->get('/auth/logout', 'AuthController:logout');

	###DASHBOARD###
	$app->get('/', 'DashboardController:index');

	###CATEGORIES###
	$app->get('/categories', 'CategoriesController:index');
	$app->post('/categories/save', 'CategoriesController:save');

	###VARIANTS###
	$app->get('/variants', 'VariantsController:index');
	$app->post('/variants/save', 'VariantsController:save');

	###PRODUCTS###
	$app->get('/products', 'ProductsController:index');
	$app->get('/products/add', 'ProductsController:getAdd');
	$app->post('/products/add', 'ProductsController:postAdd');
	$app->get('/products/edit/:slug', 'ProductsController:getEdit');
	$app->post('/products/edit/', 'ProductsController:postEdit');
	$app->get('/products/remove/:slug', 'ProductsController:getRemove');
	$app->get('/products/clean', 'ProductsController:getCleanProducts');
	#$app->post('/products/upload', 'ProductsController:postUpload');
	$app->post('/products/upload/', 'ProductsController:postUpload');
	$app->get('/products/upload/', 'ProductsController:getUpload');

	###ORDERS###
	$app->get('/orders', 'OrdersController:index');
	$app->get('/orders/view', 'OrdersController:getView');
	$app->post('/orders/print', 'OrdersController:postPrint');
	$app->post('/orders/download', 'OrdersController:postDownload');
	$app->post('/orders/save', 'OrdersController:postNote');
	$app->get('/orders/delete', 'OrdersController:getDelete');

	###PRICING###
	$app->get('/pricing', 'PricingController:index');
	$app->post('/pricing/save', 'PricingController:save');

	###SETTINGS###
	$app->get('/settings', 'SettingsController:index');
	$app->post('/settings/save', 'SettingsController:save');

	###PAYMENT METHODS###
	$app->get('/payment_methods', 'PaymentMethodsController:index');
	$app->post('/payment_methods/save', 'PaymentMethodsController:postSave');
});
$app->run();


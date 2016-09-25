<?php
/**
 *  This load the products, the categories and the settings	
 */
 
require __DIR__ . '/autoload.php';
use Symfony\Component\Yaml\Yaml;
use \Michelf\Markdown;
$result = [];
$result['status'] = true;

$data_dir = "../data/";
error_reporting(E_ALL);
//get files in folder
$files = glob($data_dir . "products/*.yml");
$products = [];
$category_names = [];
foreach($files as $file) {
	$product = Yaml::parse($file);
	$product['description'] = Markdown::defaultTransform($product['description']);
	foreach($product['variants'] as $key => $variant) {
		$product['variants'][$key]['price'] = $product['price'] + $variant['additional_price'];
	}
	
	$products[] = $product;
	$category_names[] = $product['category'];
}
usort($products, function($a, $b) {
	if(!isset($b['position']))
		$b['position'] = 1;
	if(!isset($a['position']))
		$a['position'] = 1;
    return $a['position'] - $b['position'];
});
$result['products'] = $products;

$categories = Yaml::parse($data_dir . "categories.yml");
$category_list = [];
foreach($categories as $category) {
	if(in_array($category['name'], $category_names)) {
		$category_list[] = $category;
	}
}
$result['categories'] = $category_list;

//load the settings
$settings = include $data_dir . "settings.php";
#unset($settings['stripe_secret_key']);
unset($settings['password']);
$result['settings'] = $settings;

//load the payment methods
$payment_methods = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($data_dir . 'payment_methods/')) as $filename) {
	//save yaml files
	$filetype = pathinfo($filename, PATHINFO_EXTENSION);
	if (strtolower($filetype) == 'yml') {
		$path = $filename->getPathname();
		$payment_method = Yaml::parse(file_get_contents($path));
		$hidden_keys = explode(",", $payment_method['hidden_keys']);
		$hidden_keys[] = 'hidden_keys';
		foreach($hidden_keys as $key){
			if(in_array($key, array_keys($payment_method))) {
				unset($payment_method[$key]);
			}
		}
		if($payment_method['status']) {
			$payment_method['slug'] = str_replace('.yml', '', $filename->getBasename());
			$payment_methods[] = $payment_method;
		}
	}
}

usort($payment_methods, function($a, $b) {
    return (int) $a['position'] - (int) $b['position'];
});
$result['payment_methods'] = $payment_methods;
#dd($payment_methods);

header('Content-Type: application/json');
echo json_encode($result);


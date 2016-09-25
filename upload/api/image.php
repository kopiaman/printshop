<?php
/**
 *  
 *  Fetches the design with the product image
 *  
 */
require __DIR__ . '/autoload.php';
use Symfony\Component\Yaml\Yaml;
use Intervention\Image\ImageManager;

header('Pragma: public');
header('Cache-Control: max-age=86400');
header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));
header('Content-Type: image/png');

$result = [];
$result['status'] = true;

$data_dir = "../data/";

$product = $_GET['product'];

$product_file = $data_dir . "products/$product.yml";
$product = Yaml::parse($product_file);

if(!isset($_GET['variant'])) {
	$selected_variant = $product['defaultVariant'];
} else {
	$selected_variant = $_GET['variant'];
}

if(!isset($_GET['orientation'])) {

	foreach($product['orientations'] as $orientation) {
		$selected_orientation = $orientation['name'];
		break;
	}

} else {
	$selected_orientation = $_GET['orientation'];
}

foreach($product['variants'] as $variant) {
	if($variant['slug'] == slugify($selected_variant)) {
		$image = $variant['orientations'][$selected_orientation];
	}
}

$image_file = $data_dir . "images/" . $image;

// Get new sizes
$new_width = 500;
$new_height = 500;

if(isset($_GET['w'])) {
	$new_width = (int) $_GET['w'];
}
if(isset($_GET['h'])) {
	$new_height = (int) $_GET['h'];
}
list($width, $height) = getimagesize($image_file);

$manager = new ImageManager(array('driver' => 'gd'));
$image = $manager->make($image_file)->resize($new_width, $new_height);
echo $image->response('png');

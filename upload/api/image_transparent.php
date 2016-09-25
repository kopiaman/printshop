<?php
/**
 *  
 *  Converts the image to transparent version
 *  
 */
require __DIR__ . '/autoload.php';
use Symfony\Component\Yaml\Yaml;
use Intervention\Image\ImageManager;

#header('Pragma: public');
#header('Cache-Control: max-age=86400');
#header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));
#header('Content-Type: image/png');

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
#echo "<pre>";
$image_file = $data_dir . "images/" . $image;
list($width, $height) = getimagesize($image_file);

// Create a new true color image
$im = imagecreatetruecolor($width, $height);

// Fill with alpha background
$alphabg = imagecolorallocatealpha($im, 0, 0, 0, 127);
imagefill($im, 0, 0, $alphabg);

// Convert to palette-based with no dithering and 255 colors with alpha
imagetruecolortopalette($im, false, 255);
imagesavealpha($im, true);

$original_im = imagecreatefrompng($image_file);
imagealphablending($original_im, false);

$white = imagecolorallocatealpha($im, 255, 255, 255, 0);
$transparent = imagecolorallocatealpha($im, 255, 255, 255, 127);		
for ($x = imagesx($original_im); $x--;) {
    for ($y = imagesy($original_im); $y--;) {
        $rgb = imagecolorat($original_im, $x, $y);
        $c = imagecolorsforindex($original_im, $rgb);

        if ($c['alpha'] > 120) {
            imagesetpixel($im, $x, $y, $white);
		} else { // non-transparent
            imagesetpixel($im, $x, $y, $transparent);
        }
    }
}

imageAlphaBlending($im, true);
imageSaveAlpha($im, true);
/*header('Content-Type: image/png');
imagepng($im);
imagedestroy($im);
die();*/
// Get new sizes
$new_width = 500;
$new_height = 500;

if(isset($_GET['w'])) {
	$new_width = (int) $_GET['w'];
}
if(isset($_GET['h'])) {
	$new_height = (int) $_GET['h'];
}


header('Content-Type: image/png');
$manager = new ImageManager(array('driver' => 'gd'));
$image = $manager->make($im)->resize($new_width, $new_height);
echo $image->response('png');

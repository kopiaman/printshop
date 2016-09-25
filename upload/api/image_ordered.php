<?php
require __DIR__ . '/autoload.php';

use Symfony\Component\Yaml\Yaml;
use Intervention\Image\ImageManager;

#sleep(3);
#header('Pragma: public');
#header('Cache-Control: max-age=86400');
#header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));
#header('Content-Type: image/png');

$result = [];
$result['status'] = true;

$data_dir = "../data/";

$order_id = $_GET['order'];
$index = $_GET['index'];
$orientation = $_GET['orientation'];

$order = Order::find($order_id);
$cart = json_decode($order->cart);
//get the product variation image
$dims = null;
foreach($cart[$index]->product->orientations as $orientaion_dims) {
	if($orientaion_dims->name == $orientation) {
		$dims = $orientaion_dims;	
		break;
	}
}

$image = $cart[$index]->variant->orientations->$orientation;
$image_file = $data_dir . "images/" . $image;
#dd($image_file);
$manager = new ImageManager(array('driver' => 'gd'));
$image = $manager->make($image_file)->resize($dims->width, $dims->height);


//now get the design

if(isset($cart[$index]->images->$orientation)) {
	$canvas = $cart[$index]->images->$orientation;
	list($type, $data) = explode(';', $canvas);
	list(, $data)      = explode(',', $data);
	$png = base64_decode($data);
	$layers = $manager->make($png)->resize($dims->printable_width, $dims->printable_height);
	$image->insert($layers, 'top-left', (int) $dims->printable_offset_x, (int) $dims->printable_offset_y);
}

echo $image->response('png');

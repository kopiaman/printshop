<?php
/**
 *  
 *  Before going to stripe we store the order details
 *  such as email, name, products, designs and address
 *  
 */
require __DIR__ . '/autoload.php';
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

use PayPal\CoreComponentTypes\BasicAmountType;
use PayPal\EBLBaseComponents\AddressType;
use PayPal\EBLBaseComponents\BillingAgreementDetailsType;
use PayPal\EBLBaseComponents\PaymentDetailsItemType;
use PayPal\EBLBaseComponents\PaymentDetailsType;
use PayPal\EBLBaseComponents\SetExpressCheckoutRequestDetailsType;
use PayPal\PayPalAPI\SetExpressCheckoutReq;
use PayPal\PayPalAPI\SetExpressCheckoutRequestType;
use PayPal\Service\PayPalAPIInterfaceServiceService;

use Underscore\Underscore as _;

if (!function_exists('json_last_error_msg')) {
    function json_last_error_msg() {
        static $errors = array(
            JSON_ERROR_NONE             => null,
            JSON_ERROR_DEPTH            => 'Maximum stack depth exceeded',
            JSON_ERROR_STATE_MISMATCH   => 'Underflow or the modes mismatch',
            JSON_ERROR_CTRL_CHAR        => 'Unexpected control character found',
            JSON_ERROR_SYNTAX           => 'Syntax error, malformed JSON',
            JSON_ERROR_UTF8             => 'Malformed UTF-8 characters, possibly incorrectly encoded'
        );
        $error = json_last_error();
        return array_key_exists($error, $errors) ? $errors[$error] : "Unknown error ({$error})";
    }
}

// Retrieve the request's body and parse it as JSON
$input = @file_get_contents("php://input");
$event_json = json_decode($input);

$storage_dir = __DIR__ . "/../storage/";
$settings = include __DIR__ . "/../data/settings.php";

$order = Order::where('uuid', $_SESSION['uuid'])->first();
if(!$order) {
	$order = new Order();	
} else {
	if($order->confirmed !== 0) {
		$_SESSION['uuid'] = generate_session()->toString();
		$order = new Order();
	}
}

function parse_text_layer($layer) {
	$colors = [];
	$colors[] = $layer->fill;
	$colors[] = $layer->stroke;
	return $colors;
}

function parse_graphic_layer($layer) {
	
	$colors = [];
	foreach($layer->paths as $path) {
		$colors[] = $path->fill;
		$colors[] = $path->stroke;
	}
	
	return $colors;
}

function clean_colors($colors) {
	//get rid of duplicates
	$colors = array_unique($colors);
	$color_list = [];
	foreach($colors as $color) {
		if($color && $color[0] == '#') {
			$color_list[] = $color;
		}
	}
	return $color_list;
}

function calculate_orientation_price($colors, $has_photo) {
	global $pricing;
	
	$total_colors = count($colors);
	$max_count_set = count($pricing['colors']);
	if($total_colors > $max_count_set || $has_photo) {
		$total_colors = 'INF';
	}
	
	$price = 0;
	if( isset($pricing['colors'][$total_colors]) ) {
		$price = $pricing['colors'][$total_colors];
	}
	return (float) $price;
}

function calculate_layer_cost($item) {
	global $pricing;
	
	$colors = [];
	$orientation_pricing = [];
	foreach($item->canvases as $orientation => $layers) {
		$colors[$orientation] = [];
		$has_photo = false;
		foreach($layers->objects as $layer) {
			if($layer->type == 'text' || $layer->type == 'i-text') {
				$colors[$orientation] = array_merge($colors[$orientation], parse_text_layer($layer));
			}			
			if($layer->type == 'path-group') {
				$colors[$orientation] = array_merge($colors[$orientation], parse_graphic_layer($layer));
			}			
			if($layer->type == 'image') {
				$has_photo = true;
			}
		}
		$colors[$orientation] = clean_colors($colors[$orientation]);
		$orientation_pricing[$orientation] = calculate_orientation_price($colors[$orientation], $has_photo);
	}
	
	$orientation_pricing = array_sum($orientation_pricing);
	
	$sides_designed = 0;
	foreach($colors as $side => $values) {
		$sides_designed += (count($values) > 0)?1:0;
	}
	$additional_side_cost = _::findWhere($pricing['charges_per_side'], ['sides' => $sides_designed]);
	if($additional_side_cost) {
		$orientation_pricing += $additional_side_cost['price'];
	}
	
	return $orientation_pricing;
	
}

$pricing = Yaml::parse(file_get_contents(__DIR__ . '/../data/pricing.yml'));

function calculate_discount_per_item($quantity) {
	global $pricing;
	
	$discount_rate = 0;
	foreach($pricing['bulk_discounts'] as $bulk_discount) {
		if($bulk_discount['from'] == '')
			continue;
		$price_lower_limit = (int) $bulk_discount['from'];
		$price_upper_limit = ($bulk_discount['to'] == 'INF')? INF : (int) $bulk_discount['to'];
		if( $quantity >= $price_lower_limit && $quantity <= $price_upper_limit ) {
			$discount_rate = (float) $bulk_discount['discount'];
		}		
	}
	return $discount_rate;
}

function calculate_subtotal() {
	global $pricing, $event_json;
	
	
	$total = 0;
	$single_price = 0;
	foreach($event_json->cart as $k => $item) {

		$base_price = $item->variant->price;
		$quantity = array_sum((array) $item->quantities);
		$single_price = $base_price;
		
		$single_price += calculate_layer_cost($item); //add layers pricing
		
		$event_json->cart[$k]->single_price = $single_price;		
		$sum_price = $single_price * $quantity; //per item
		
		$discount_rate = calculate_discount_per_item($quantity);
		if($discount_rate > 0) {
            $discount = $sum_price*($discount_rate/100);
            $sum_price = $sum_price - $discount;
        }
		$event_json->cart[$k]->discount_rate = $discount_rate;
		$event_json->cart[$k]->discount = $discount;
		#dd($item->price, $single_price, $quantity, $event_json->cart[$k]->discount, $sum_price);
		#echo $item->product->name . " - " . $item->variant->price . " - " . $sum_price . "\n";
		$total += $sum_price;
	}
	
	return $total;
}

$subtotal = calculate_subtotal($event_json);

if(!$subtotal) {
	die('ERROR');	
}

$postage = $pricing['delivery_types'][$event_json->postage]['price'];
$total_price = $subtotal + $postage; //add postage
#dd($subtotal, $postage, $total_price);

$order->checkout_details = json_encode($event_json->checkout_details, JSON_UNESCAPED_UNICODE);
$order->customer_details = json_encode($event_json->customer_details, JSON_UNESCAPED_UNICODE);
$order->cart = json_encode($event_json->cart, JSON_UNESCAPED_UNICODE);
$order->firstname = @$event_json->customer_details->firstname;
$order->lastname = @$event_json->customer_details->lastname;
$order->email = @$event_json->customer_details->email;
$order->currency = $event_json->checkout_details->currency;
$order->uuid = $_SESSION['uuid'];
$order->subtotal = $subtotal;
$order->postage = $postage;
$order->amount = number_format($total_price, 2, '.', '');
$order->dispatched = false;
$order->payment_status = 'awaiting_payment';
$order->fulfillment_status = 'awaiting_processing';
$order->confirmed = 0;
$order->payment_method = $event_json->payment_method;
$order->save();


$folder = md5($order->id);
$hash_folder = $folder[0]."/".$folder[1]."/";
$hash_path = $storage_dir.$hash_folder;
if(!is_dir($hash_path)) {
	mkdir($hash_path, 0777, true);
}

//dump images into storage
/*
foreach($event_json->orientation_data as $orientation => $values) {
	if(!$values->image)
		continue;
	list($type, $data) = explode(';', $values->image);
	list(, $data)      = explode(',', $data);
	
	$data = base64_decode($data);

	file_put_contents($hash_path.$orientation.'.png', $data);
}
*/
$result = [];
$result['id'] = $order->id;
$result['amount'] = $order->amount;
$result['payment_method'] = $event_json->payment_method;
$result['_subtotal'] = $subtotal;
$result['_postage_id'] = $event_json->checkout_details->postage;
$result['_e_postage_id'] = $event_json->postage;
$result['_postage'] = $postage;
$result['_total_price'] = $total_price;
if($event_json->payment_method == 'paypal') {
	$result['token'] = $token;
}
echo json_encode(['order' => $result]);


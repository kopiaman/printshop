<?php
/**
 *  
 *  This call shows the transaction details
 *  
 */
require __DIR__.'/../../autoload.php';
use Symfony\Component\Yaml\Yaml;
use Carbon\Carbon;

$settings = include __DIR__ . "/../../../data/settings.php";

// Retrieve the request's body and parse it as JSON
$input = @file_get_contents("php://input");
$event_json = json_decode($input);

//now show the order details
$result = [];
$result['status'] = true;
$data_dir = __DIR__ . "/../../../data/";
$pricing = Yaml::parse($data_dir . "pricing.yml");

$order = Order::find($event_json->orderId);
$payment_details = json_decode($order->payment_details);
$checkout_details = json_decode($order->checkout_details);
$result['amount'] = number_format($order->amount, 2);
$result['currency'] = $order->currency;
$result['date'] = Carbon::parse($order->created_at)->toDateTimeString();
$result['transaction_id'] = str_replace("ch_", "", $order->transaction_id);
$result['postage'] = $pricing['delivery_types'][$checkout_details->postage]['name'];
$result['description'] = $checkout_details->title;
$result['email'] = $order->email;

$_SESSION['uuid'] = generate_session()->toString();	 //reset session

header('Content-Type: application/json');
echo json_encode($result);


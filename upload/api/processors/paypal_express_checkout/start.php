<?php

require __DIR__ . '/../../autoload.php';
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
use PayPal\Core\PPHttpConfig;

ini_set('display_errors', 1);

$settings = include __DIR__ . "/../../../data/settings.php";

$order_id = (int) $_GET['id'];
$order = Order::find($order_id);
if(!$order)
	die();

//if it's paypal we need to get a token
if($order->payment_method == 'paypal_express_checkout') {
	
	$payment_settings = Yaml::parse(file_get_contents(__DIR__ . '/../../../data/payment_methods/'.$order->payment_method.'.yml'));
	
	$config = array (
		'mode' 				=> $payment_settings['paypal_environment'], 
		'acct1.UserName' 	=> $payment_settings['paypal_username'],
		'acct1.Password' 	=> $payment_settings['paypal_password'],
		'acct1.Signature' 	=> $payment_settings['paypal_signature']
	);
	$order_cart = json_decode($order->cart);
	$paypalService = new PayPalAPIInterfaceServiceService($config);
	$paymentDetails= new PaymentDetailsType();

	$itemDetails = new PaymentDetailsItemType();
	$itemDetails->Name = count($order_cart) . ' items';
	$itemAmount = $order->amount;
	$itemDetails->Amount = $itemAmount;
	$itemQuantity = '1';
	$itemDetails->Quantity = $itemQuantity;

	$itemDetails->ItemCategory =  'Physical';

	$paymentDetails->PaymentDetailsItem[0] = $itemDetails;

	$orderTotal = new BasicAmountType();
	$orderTotal->currencyID = $order->currency;
	$orderTotal->value = $order->amount; 

	$paymentDetails->OrderTotal = $orderTotal;
	$paymentDetails->PaymentAction = 'Sale';

	$setECReqDetails = new SetExpressCheckoutRequestDetailsType();
	$setECReqDetails->PaymentDetails[0] = $paymentDetails;
	$setECReqDetails->CancelURL = $settings['site_url'] . '/api/processors/paypal_express_checkout/checkout_cancel.php';
	$setECReqDetails->ReturnURL = $settings['site_url'] . '/api/processors/paypal_express_checkout/checkout_success.php';
	$setECReqDetails->SolutionType = 'Sole';
	$setECReqDetails->LandingPage = 'Billing';

	$setECReqType = new SetExpressCheckoutRequestType();
	$setECReqType->Version = '104.0';
	$setECReqType->SetExpressCheckoutRequestDetails = $setECReqDetails;

	$setECReq = new SetExpressCheckoutReq();
	$setECReq->SetExpressCheckoutRequest = $setECReqType;
	
	$curl_version = curl_version();
	if (substr($curl_version['ssl_version'], 0, 3) === 'NSS') {
		unset(PPHttpConfig::$DEFAULT_CURL_OPTS[CURLOPT_SSL_CIPHER_LIST]);
	}
	
	$setECResponse = $paypalService->SetExpressCheckout($setECReq);
	
	/* check the return status */
	if($setECResponse->Ack == 'Success') {
		$token = $setECResponse->Token;
		$order->token = $token;
		$order->save();
	} else {
		$token = "none";
		echo "<pre>";
		print_r($setECResponse);
		die();
	}

}

if($token != "none") {
	$paypal_url = "https://www.paypal.com";
	if($payment_settings['paypal_environment'] == 'sandbox') {
		$paypal_url = "https://www.sandbox.paypal.com";
	}
	$redirect_url = $paypal_url . "/cgi-bin/webscr?cmd=_express-checkout&force_sa=true&token=" . $token;
	
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Please wait</title>

  </head>
  <body>
<style type='text/css'> uiload {
  display: inline-block;
  position: relative; }
  uiload > div {
    position: relative; }

@-webkit-keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); } }

@-moz-keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); } }

@-ms-keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); } }

@keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); } }

.uil-ring-css {
  background: none;
  position: relative;
    margin: 40px auto;

  width: 200px;
  height: 200px; }
  .uil-ring-css > div {
    position: absolute;
    display: block;
    width: 160px;
    height: 160px;
    top: 20px;
    left: 20px;
    border-radius: 80px;
    box-shadow: 0 6px 0 0 #1863E6;
    -ms-animation: uil-ring-anim 1s linear infinite;
    -moz-animation: uil-ring-anim 1s linear infinite;
    -webkit-animation: uil-ring-anim 1s linear infinite;
    -o-animation: uil-ring-anim 1s linear infinite;
    animation: uil-ring-anim 1s linear infinite; }
 </style> 
<div class='uil-ring-css' style='-webkit-transform:scale(0.6)'>
  <div></div>
</div>
<script>window.location.href = '<?= $redirect_url ?>'</script>
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
  </body>
</html>

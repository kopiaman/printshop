<?php
/**
 *  
 *
 * Get the pricing set
 *  
 */	
require __DIR__ . '/autoload.php';
use Symfony\Component\Yaml\Yaml;
use \Michelf\Markdown;
$result = [];
$result['status'] = true;

$data_dir = "../data/";

$pricing = Yaml::parse($data_dir . "pricing.yml");
foreach($pricing['bulk_discounts'] as $k => $v) {
	if($v['from'] == '') {
		unset($pricing['bulk_discounts'][$k]);
	}
	$pricing['bulk_discounts'][$k]['from'] = (int) $pricing['bulk_discounts'][$k]['from'];
	$pricing['bulk_discounts'][$k]['to'] = (int) $pricing['bulk_discounts'][$k]['to'];
	$pricing['bulk_discounts'][$k]['discount'] = (float) $pricing['bulk_discounts'][$k]['discount'];
}
$result['bulk_discounts'] = array_values($pricing['bulk_discounts']);
$result['charges_per_side'] = $pricing['charges_per_side'];
$result['pricing'] = $pricing['colors'];
$result['delivery_types'] = $pricing['delivery_types'];

if(file_exists($data_dir . 'palette.json')) {
	$result['palette'] = json_decode(file_get_contents($data_dir . 'palette.json'));
}

header('Content-Type: application/json');
echo json_encode($result);


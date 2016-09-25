<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

class PricingController extends BaseController
{
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'pricing';
	}

    public function index() {
		$pricing = Yaml::parse(file_get_contents('../data/pricing.yml'));

		foreach($pricing['colors'] as $k => $v) {
			$pricing['colors'][$k] = (float) number_format($pricing['colors'][$k], 2);
		}
        
		foreach($pricing['delivery_types'] as $k => $v) {
			$pricing['delivery_types'][$k]['price'] = (float) number_format($pricing['delivery_types'][$k]['price'], 2);
		}
/*
		$pricing['charges_per_side'] = [];
		$pricing['charges_per_side'][] = ['sides' => 1, 'price' => 0.00];
		$pricing['charges_per_side'][] = ['sides' => 2, 'price' => 0.00];
		$pricing['charges_per_side'][] = ['sides' => 3, 'price' => 0.00];
		$pricing['charges_per_side'][] = ['sides' => 4, 'price' => 0.00];
		$pricing['charges_per_side'][] = ['sides' => 5, 'price' => 0.00];
		$pricing['charges_per_side'][] = ['sides' => 6, 'price' => 0.00];
		


		$quantities = [];
		$quantities[] = ['from' => 0, 	'to' => 24, 	'discount' => 0];
		$quantities[] = ['from' => 25, 	'to' => 50, 	'discount' => 2.5];
		$quantities[] = ['from' => 50, 	'to' => 143, 	'discount' => 5];
		$quantities[] = ['from' => 150, 'to' => 299, 	'discount' => 10];
		$quantities[] = ['from' => 300, 'to' => 599, 	'discount' => 15];
		$quantities[] = ['from' => 600, 'to' => 1500, 	'discount' => 17.5];
		$quantities[] = ['from' => 1500,'to' => 3000, 	'discount' => 20];
		$quantities[] = ['from' => 3000, 'to' => '> 3000', 	'discount' => 22.5];
		$quantities[] = ['from' => '', 'to' => '', 	'discount' => ''];
		$quantities[] = ['from' => '', 'to' => '', 	'discount' => ''];
		$pricing['bulk_discounts'] = $quantities;
*/
		$this->data['pricing'] = $pricing;
		echo $this->view->render('pricing.tpl.php', $this->data);
	}
	
    public function save() {
        $json = file_get_contents('php://input');
		$post = json_decode($json, true);
        
		$charges_per_side = [];
		foreach($post['charges_per_side'] as $k => $v) {
			$charges_per_side[$k] = $v;
		}
		
		$bulk_discounts = [];
		foreach($post['bulk_discounts'] as $k => $v) {
			if(isset($post['bulk_discounts'][ $k + 1]))
				$next_limit = $post['bulk_discounts'][ $k + 1]['from'];
			
			if($next_limit)
				$next_limit = $next_limit - 1;
			if($v['from'] === '') {
				$next_limit = '';
			}
			if(!$next_limit && is_numeric($v['from'])) {
				$next_limit = 'INF';
			}
			if(is_numeric($v['from'])) {
				$v['from'] = (int) $v['from'];
			}
			$bulk_discounts[(int) $k] = ['from' => $v['from'], 'to' => $next_limit, 'discount' => $v['discount']];
		}
		#dd($bulk_discounts);
		foreach($post['colors'] as $k => $v) {
			$post['colors'][$k] = number_format($post['colors'][$k], 2);
		}
        
		foreach($post['delivery_types'] as $k => $v) {
			$post['delivery_types'][$k]['price'] = number_format($post['delivery_types'][$k]['price'], 2);
		}

		$pricing_list = [];
		$pricing_list['bulk_discounts'] = $bulk_discounts;
		$pricing_list['charges_per_side'] = $charges_per_side;
		$pricing_list['colors'] = $post['colors'];
		$pricing_list['delivery_types'] = $post['delivery_types'];
		
		$dumper = new Dumper();
		$yaml = $dumper->dump($pricing_list, 2);
		file_put_contents('../data/pricing.yml', $yaml);

		echo json_encode(['status' => true]);
    }

}

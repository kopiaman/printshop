<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

class PaymentMethodsController extends BaseController
{
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'payment_methods';
	}
	
    public function index() {
		
		$payment_methods = [];
    	foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('../data/payment_methods/')) as $filename) {
			//save yaml files
			$filetype = pathinfo($filename, PATHINFO_EXTENSION);
			if (strtolower($filetype) == 'yml') {
				$path = $filename->getPathname();
				$payment_method = Yaml::parse(file_get_contents($path));
				$payment_methods[str_replace('.yml', '', $filename->getBasename())] = $payment_method;
			}
		}
		$this->data['payment_methods'] = $payment_methods;
		echo $this->view->render('payment_methods.tpl.php', $this->data);
	}

    private function getPaymentMethod($payment_method) {
		$payment_method = Yaml::parse(file_get_contents('../data/payment_methods/'.$payment_method.'.yml'));
		return $payment_method;
	}
	
    public function postSave() {
		$json = file_get_contents('php://input');
		$payment_methods = json_decode($json, true);
		
		$folder = '../data/payment_methods/';
		foreach($payment_methods as $payment_method => $method_values) {
			#$yaml = $this->getPaymentMethod($payment_method);
				
			$dumper = new Dumper();
			$yaml = $dumper->dump($method_values, 2);
			
			file_put_contents($folder . $payment_method .'.yml', $yaml);
			
		}
		
		echo json_encode(['status' => true]);

    }

}
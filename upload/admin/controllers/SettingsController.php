<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

class SettingsController extends BaseController
{	
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'settings';
	}

    public function index() {
        
        $currencies = file_get_contents("../data/common_currencies.json");
        $currencies = json_decode($currencies);
        
		$settings = include __DIR__ . '/../../data/settings.php';
		if(!isset($settings['site_url'])) {
			$settings['site_url'] = str_replace("/admin/settings", "", "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]");
		}
		$this->data['settings'] = $settings;
		$this->data['currencies'] = $currencies;
		$this->data['print_formats'] = ['tiff', 'pdf', 'svg', 'png'];
		
		$products = [];
    	foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('../data/products/')) as $filename) {
			//save yaml files
			$filetype = pathinfo($filename, PATHINFO_EXTENSION);
			if (strtolower($filetype) == 'yml') {
				$path = $filename->getPathname();
				$product = Yaml::parse(file_get_contents($path));
				$tmp = [];
				$tmp['name'] = $product['name'];
				$tmp['slug'] = $product['slug'];
				$tmp['category'] = $product['category'];
				$tmp['price'] = $product['price'];
				$products[] = $product;
			}
		}

		$this->data['products'] = $products;
		$languages = [];
    	foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('../data/languages/')) as $filename) {
			//save yaml files
			$filetype = pathinfo($filename, PATHINFO_EXTENSION);
			if (strtolower($filetype) == 'po') {
				$path = $filename->getPathname();
				$tmp = [];
				$tmp['code'] = str_replace('.po', '', $filename->getBasename());
				$languages[] = $tmp;
			}
		}
		$this->data['languages'] = $languages;

		echo $this->view->render('settings.tpl.php', $this->data);
	}
	
    public function save() {
    	$config = include '../data/settings.php';

    	if(isset($_POST['password']) && !empty($_POST['password'])) {
    		if($_POST['password'] == $_POST['confirm_password']) {
				$config['password'] = md5($_POST['password']);
    		} else {
				redirect_to('settings', array('error' => "Error : The entered passwords do not match"));
    		}
    	}

		$config['site_name'] = trim($_POST['site_name']);
		$config['site_url'] = trim($_POST['site_url']);
		$config['site_url'] = rtrim($config['site_url'], '/'); //no trailing slash
		$config['currency'] = $_POST['currency'];
		$config['default_product'] = $_POST['default_product'];
		$config['email'] = $_POST['email'];
		$config['language'] = $_POST['language'];
		#$config['print_format'] = $_POST['print_format'];
		$config['print_format'] = 'pdf';

		$currencies = file_get_contents("../data/common_currencies.json");
        $currencies = json_decode($currencies, true);
		$config['currency_symbol'] = $currencies[$_POST['currency']]['symbol'];

		file_put_contents('../data/settings.php', '<?php return ' . var_export($config, true) . ';');

		redirect_to('settings', array('success' => "Successfully saved"));
    }

}
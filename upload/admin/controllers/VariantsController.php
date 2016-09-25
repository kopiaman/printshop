<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

class VariantsController extends BaseController
{
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'variants';
	}

    public function index() {
		$variants = Yaml::parse(file_get_contents('../data/variants.yml'));
		$variants_list = [];
		foreach($variants as $k => $variant) {
			$variant['myHexes'] = $variant['hexes'];
			$variants_list[$k] = $variant;
		}
		$this->data['variants'] = $variants_list;
		echo $this->view->render('variants.tpl.php', $this->data);
	}

    public function save() {

		$json = file_get_contents('php://input');
		$variants = json_decode($json, true);
		$dumper = new Dumper();

		$variants_list = [];
		foreach($variants as $k => $variant) {
			if(is_null($variant['myHexes']))
				continue;
			$variant['slug'] = slugify($variant['name']);
			$variant['hexes'] = $this->removeNulls($variant['myHexes']);
			unset($variant['myHexes']);
			$variants_list[] = $variant;
		}

		$yaml = $dumper->dump($variants_list, 2);
		file_put_contents('../data/variants.yml', $yaml);
		$_SESSION['success'] = "Successfuly saved!";
		echo json_encode(['status' => true]);
    }
	
    private function removeNulls($myHexes) {

		$hexes = [];
		foreach($myHexes as $k => $hex) {
			if(!is_null($hex)) {
				$hexes[] = $hex;
			}
		}
		
		return $hexes;
    }

}
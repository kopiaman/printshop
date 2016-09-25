<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

class CategoriesController extends BaseController
{
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'categories';
	}

    public function index() {
		$categories = Yaml::parse(file_get_contents('../data/categories.yml'));
		$this->data['categories'] = $categories;
		echo $this->view->render('categories.tpl.php', $this->data);
	}
	
	function arrayPluck ($toPluck, $arr) {
		return array_map(function ($item) use ($toPluck) {
			return $item[$toPluck];
		}, $arr); 
	}
	
    public function cleanProducts($category_list) {
		$category_names = $this->arrayPluck('name', $category_list);
		
		foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('../data/products/')) as $filename) {
			//save yaml files
			$filetype = pathinfo($filename, PATHINFO_EXTENSION);
			if (strtolower($filetype) == 'yml' || is_dir($filename)) {

				$path = $filename->getPathname();
				$product = Yaml::parse(file_get_contents($path));
				if(!in_array($product['category'], $category_names)) {
					$product['category'] = 'Untitled';
					$category_names[] = 'Untitled';
					$dumper = new Dumper();
					$yaml = $dumper->dump($product, 2);
					file_put_contents('../data/products/' . $product['slug'].'.yml', $yaml);
				}

			}
		}
		
		$category_list = [];
		foreach($category_names as $category) {
			if( $category != '' ) {
				$category_list[] = ['name' => $category, 'slug' => slugify($category)];
			}
		}
		
		return $category_list;
	}
		
    public function save() {
		$json = file_get_contents('php://input');
		$categories = json_decode($json, true);
		
		$dumper = new Dumper();

		$category_list = [];
		foreach($categories as $category) {
			if( $category['name'] != '' ) {
				$category_list[] = ['name' => $category['name'], 'slug' => slugify($category['name'])];
			}
		}
		
		$category_list = $this->cleanProducts($category_list);
		
		$yaml = $dumper->dump($category_list, 2);
		file_put_contents('../data/categories.yml', $yaml);
		
		echo json_encode(['status' => true]);
	}

}


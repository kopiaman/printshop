<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;

class ProductsController extends BaseController
{
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'products';
	}

    private function getProducts() {
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
				$products[] = $tmp;

			}
			
		}
		return $products;
	}
	
    public function index() {
		$this->data['products'] = $this->getProducts();
		echo $this->view->render('products.tpl.php', $this->data);
	}
	
    public function getAdd() {
    	$categories = Yaml::parse(file_get_contents('../data/categories.yml'));
		$this->data['categories'] = $categories;

    	echo $this->view->render('products_add.tpl.php', $this->data);
    }	

    public function postAdd() {
    	
    	$product = [];
    	$product['name'] = $_POST['name'];
    	$product['slug'] = slugify($_POST['name']);
    	$product['description'] = $_POST['description'];
    	$product['category'] = $_POST['category'];
		
		//set up some defaults
		$orientation = [];
		$orientation['name'] = 'Front';
		$orientation['width'] = 500;
		$orientation['height'] = 500;
		$orientation['printable_width'] = 400;
		$orientation['printable_height'] = 400;
		$orientation['printable_offset_x'] = 50;
		$orientation['printable_offset_y'] = 50;
		$product['orientations'] = [];
		$product['orientations'][] = $orientation;
		$product['sizes'] = [];
		$product['sizes'][] = ['name' => 'S'];
		$product['sizes'][] = ['name' => 'M'];
		$product['sizes'][] = ['name' => 'L'];
		
		//variants
		$variant = [];
		$variant['name'] = 'white';
		$variant['slug'] = 'white';
		$variant['additional_price'] = 0;
		$variant['colors'] = ['#FFFFFF'];
		$variant['orientations'] = [];
		$variant['orientations']['Front'] = 'blank.jpg';
		
		$product['variants'] = [];
		$product['variants'][] = $variant;
		$product['defaultVariant'] = ['white'];
		$product['price'] = '0.00';

		$dumper = new Dumper();
		$yaml = $dumper->dump($product, 2);
		$folder = '../data/products/';
		if(file_exists($folder . $product['slug'].'.yml')) {
			redirect_to('products/add', array('error' => "A product with this name already exists", 'vars' => $_POST));
		} else {
			file_put_contents($folder . $product['slug'].'.yml', $yaml);
			redirect_to('products/edit/'. $product['slug'], array('success' => "Successfully saved"));
		}

    }

    public function getRemove($slug = null) {
		unlink('../data/products/'.$slug.'.yml');
		echo json_encode(['status' => true]);
    }
	
    public function getEdit($slug = null) {
    	
    	$categories = Yaml::parse(file_get_contents('../data/categories.yml'));
		$this->data['categories'] = $categories;  

    	$product = Yaml::parse(file_get_contents('../data/products/'.$slug.'.yml'));
		$sizes = [];
		foreach($product['sizes'] as $k => $size) {
			if(!is_array($size)) {
				$sizes[$k] = ['name' => $size];
			} else {
				$sizes[$k] = $size;
			}
		}
		$product['sizes'] = $sizes;
		$this->data['product'] = $product;

		$variants = Yaml::parse(file_get_contents('../data/variants.yml'));
		$variants_list = [];
		foreach($variants as $k => $variant) {
			$variant['myHexes'] = $variant['hexes'];
			$variants_list[$k] = $variant;
		}
		$this->data['variants'] = $variants_list;

    	echo $this->view->render('products_edit.tpl.php', $this->data);

    }	
	
    public function getUpload() {
    	header("HTTP/1.0 404 Not Found");
		die();
    }		

    public function postUpload() {
    	$upload_dir = "../data/images/";
    	//move and update yaml
		move_uploaded_file($_FILES["file"]["tmp_name"], $upload_dir . $_POST["flowFilename"]);
		echo json_encode( ['status' => true, 'filename' => $_POST["flowFilename"] ] );
    }	
	
	function arrayPluck ($toPluck, $arr) {
		return array_map(function ($item) use ($toPluck) {
			return $item[$toPluck];
		}, $arr); 
	}
	
    public function postEdit() {

    	$json = file_get_contents('php://input');
		$post = json_decode($json, true);
    	//now save it
		$categories = Yaml::parse(file_get_contents('../data/categories.yml'));
		$categories = $this->arrayPluck('name', $categories);
		
    	$product = [];
    	$product['name'] = $post['name'];
    	$product['slug'] = $post['slug'];
    	$product['description'] = $post['description'];
		$product['category'] = $post['category'];
		if(!in_array($product['category'], $categories)) {
			$product['category'] = 'Untitled';
		}
    	$product['position'] = (int) @$post['position'];
    	$product['price'] = $post['price'];
    	$product['sizes'] = $this->arrayPluck('name', $post['sizes']);
		if(isset($post['hexes'])) {
			$variant['colors'] = $post['hexes'];
		}

    	$product['orientations'] = $post['orientations'] ;

		$variants = [];
    	foreach($post['variants'] as $variant) {
			$tmp = $variant;
			$tmp['name'] = $variant['name'];
			if(isset($variant['price'])) {
				$tmp['price'] = $variant['price'];
			} else {
				$tmp['price'] = $product['price'];
			}

			$tmp['orientations'] = [];
			foreach($product['orientations'] as $orientation) {
				$img = "blank.jpg";
				if(isset($variant['orientations'][$orientation['name']])) {
					$img = $variant['orientations'][$orientation['name']];
				}

				$tmp['orientations'][$orientation['name']] = $img;
			}

			$variants[] = $tmp;
    	}
    	$product['variants'] = $variants;
    	$product['defaultVariant'] = $post['defaultVariant']['name'];

    	$dumper = new Dumper();
		$yaml = $dumper->dump($product, 2);
		$folder = '../data/products/';
		file_put_contents($folder . $product['slug'].'.yml', $yaml);
		$_SESSION['success'] = "Successfuly saved!";
		
		$sizes = [];
		foreach($product['sizes'] as $k => $size) {
			$sizes[$k] = ['name' => $size];
		}
		$product['sizes'] = $sizes;
		
		echo json_encode(['status' => true, 'product' => $product]);
    }	

    public function getCleanProducts() {
		$products = [];
		$images_needed = [];
    	foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('../data/products/')) as $filename) {
			//save yaml files
			$filetype = pathinfo($filename, PATHINFO_EXTENSION);
			if (strtolower($filetype) == 'yml' || is_dir($filename)) {

				$path = $filename->getPathname();
				$product = Yaml::parse(file_get_contents($path));
				foreach($product['variants'] as $variant) {
					foreach($variant['orientations'] as $orientation) {
						$images_needed [] = $orientation;
					}
				}

			}
			
		}
		
		foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('../data/images/')) as $filename) {
			//save yaml files
			$filetype = pathinfo($filename, PATHINFO_EXTENSION);
			if (strtolower($filetype) == 'png' || is_dir($filename)) {

				$path = $filename->getFilename();
				if(!in_array($path, $images_needed)) {
					unlink('../data/images/'.$path);
				}

			}
			
		}
		
		
	}

}
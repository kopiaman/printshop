<?php
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml;
use Carbon\Carbon;
class OrdersController extends BaseController
{
	private $dpi = 300;

	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'orders';
	}
		
    public function index() {
		
		$this->data['per_page'] = 20;

		$page = 1;
		if(isset($_GET['page']) && !empty($_GET['page'])) {
			$page = (int) $_GET['page'];
		}
		$page_no = $page - 1;		
		$orders = Order::orderBy('dispatched_on', 'DESC')
					->orderBy('created_at', 'DESC')
					->where('confirmed', 1);
		$query = null;
		
		
		if(isset($_GET['query']) && !empty($_GET['query'])) {
			$query = $_GET['query'];
			$orders = $orders->where('firstname', 'LIKE', '%'.$query.'%')
							->orWhere('lastname', 'LIKE', '%'.$query.'%')
							->orWhere('id', 'LIKE', '%'.$query.'%');
		}
		
		$this->data['total_items'] = $orders->count();
		$this->data['max_pages'] = ceil($this->data['total_items'] / $this->data['per_page']);
		$this->data['current_page'] = $page;
		$this->data['previous_page'] = ($page-1)?$page-1:1;
		$this->data['next_page'] = ($page+1 > $this->data['max_pages'])?$this->data['max_pages']:$page+1;
		
		$orders = $orders->skip($this->data['per_page']*$page_no)
						->take($this->data['per_page']);
		
		$this->data['orders'] = $orders->get();
		$this->data['carbon'] = new Carbon();
		$this->data['query'] = $query;
		
		echo $this->view->render('orders.tpl.php', $this->data);
	}
	
    public function formatCart($cart) {
		$cart = json_decode($cart);
		foreach($cart as $k => $item) {
			$cart[$k]->single_price = (float) preg_replace("[^0-9]", "", $cart[$k]->single_price);
			$cart[$k]->total_quantity = array_sum((array) $item->quantities);
			$cart[$k]->total_price = $item->total_quantity * $item->single_price;
		}
		return $cart;
	}
	
    public function getSubTotal($cart) {
		$subtotal = 0;
		foreach($cart as $k => $item) {
			$subtotal += $cart[$k]->total_price;
		}
		return $subtotal;
	}
	
    public function getView() {
		
		$id = $_GET['id'];
		$order = Order::find($id);
		if(!$order) {
			redirect_to('orders');
			die();
		}
		#dd($order);
		$this->data['order'] = $order;
		$this->data['customer_details'] = json_decode($order->customer_details);		
		$this->data['payment_details'] = json_decode($order->payment_details);		
		$this->data['cart'] = $this->formatCart($order->cart);		
		#dd($this->data['cart']);
		$this->data['subtotal'] = $this->getSubTotal($this->data['cart']);		
		$this->data['fonts_required'] = $this->getFontsRequired($this->data['cart']);
		$this->data['carbon'] = new Carbon();
		$settings = include '../data/settings.php';
		$this->data['print_format'] = $settings['print_format'];

		$this->data['imagick_not_installed'] = (!extension_loaded('imagick'));
		echo $this->view->render('orders_view.tpl.php', $this->data);
	}
	
	private function getFontMeta($font_name, $font_list) {
		foreach($font_list as $k => $font) {
			if($font['name'] == $font_name) {
				return $font;
			}
		}
		return false;
	}
		
	private function getFontsRequired($cart) {
		$font_list = [];
		$font_jsons = glob("../data/fonts/json/*.json");
		foreach($font_jsons as $font) {
			$font_meta = json_decode(file_get_contents($font), true);
			$font_path = "../data/".$font_meta['regular']['ttf'];
			
			if(file_exists($font_path)) {
				$font_list[] = $font_meta;
			}
		}
		
		$fonts = [];
		foreach($cart as $i => $item) {

			foreach($item->canvases as $side => $canvas) {
				
				foreach($canvas->objects as $object) {
					
					if (strpos($object->type, 'text') !== false) {
						$fonts[$object->fontName] = $this->getFontMeta($object->fontName, $font_list);
					}					
				}
			}
			
		}
		
		return $fonts;
	}

    public function convertHiRes($image, $dims, $path) {
		//get png
		list($type, $data) = explode(';', $image);
		list(, $data)      = explode(',', $data);
		
		$data = base64_decode($data);
		
		$dpi = 300;
		$printable_width = ($dims['printable_width'] * $dpi)/25.4;
		$printable_height = ($dims['printable_height'] * $dpi)/25.4;
		#dd($printable_width, $printable_height);
		//convert to 300dpi
		$im = new Imagick();
		$im->setResolution(300, 300);
		$im->readImageBlob($data);
		$im->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
		
		$settings = include '../data/settings.php';
		$format = $settings['print_format'];
		
		//save as TIFF 300dpi
		/*if($format == 'tiff') {
			$im->setImageFormat("tiff");
			$im->setImageCompression(Imagick::COMPRESSION_LZW); //reduce file size
		}		
		if($format == 'png') {
			$im->setImageFormat("png");
		}		
		if($format == 'pdf') {
			$im->setImageFormat("pdf");
			$im->resizeImage($printable_width,$printable_height,Imagick::FILTER_LANCZOS,1);
		}*/
		$im->setImageFormat("pdf");
		$im->resizeImage($printable_width,$printable_height,Imagick::FILTER_LANCZOS,1);
			
		$im->writeImage($path);
		$im->clear();
		$im->destroy();	
	}
	
    public function postPrintPDF() {
		#resize svg 		 : python svg-resize.py test.svg r.svg -x 266.616682285 -y 430.8716026188
		#convert svg to pdf  : wkhtmltopdf r.svg r.pdf
	}
		
    public function postDownload() {
		$json = file_get_contents('php://input');
		$post = json_decode($json, true);
		
		
		//set up storage path
		$order_id = $post['order_id'];
		$cart_index = $post['index'];
		$orientation = $post['orientation'];
		$order = Order::find($order_id);
		
		$storage_dir = "../storage/orders/";
		$folder = md5($order_id);
		$hash_folder = $folder[0]."/".$folder[1]."/".$folder."/";
		$hash_path = $storage_dir.$hash_folder;
		if(!is_dir($hash_path)) {
			mkdir($hash_path, 0777, true);
		}
		
		
		
		$images = [];
		foreach(json_decode($order->cart, true)[$cart_index]['canvases'][$orientation]['objects'] as $object) {
			
			if($object['type'] == 'image') {
				$images[] = __DIR__ . '/../../storage/' .  end(explode('storage/', $object['src']));
			}
			
		}
		
		if(count($images) == 0) {
			$results = [];
			$results['status'] = false;
			$results['msg'] = 'No images found';
			echo json_encode( $results );
		}
		
		$zip = new ZipArchive();
		$filename = "$cart_index-$orientation.zip";
		$zip_file = $hash_path . $filename;
		if(file_exists($zip_file)) {
			unlink ($zip_file);
		}
		
		$res = $zip->open($zip_file, ZIPARCHIVE::CREATE);
		
		if ($res === TRUE) {			
			foreach($images as $image) {				
				if(file_exists($image)) {
					$zip->addFromString(basename($image), file_get_contents($image));
				}
			}
		} else {
			var_dump($res);
		}
		$zip->close();
		
		$results = [];
		$results['status'] = true;
		$results['path'] = $zip_file;
		echo json_encode( $results );
		
	}

	
    public function postPrint() {
	
		error_reporting(E_ALL);
		ini_set('display_errors', true);

    	$json = file_get_contents('php://input');
		$post = json_decode($json, true);
    	
    	$high_res_img = $post['high_res_img'];		
    	$product = $post['product'];
    	$selected_orientation = $post['orientation'];
    	$order_id = $post['order_id'];
    	$index = $post['index'];
				
		//set up storage path
		$storage_dir = "../storage/orders/";
		$folder = md5($order_id);
		$hash_folder = $folder[0]."/".$folder[1]."/";
		$hash_path = $storage_dir.$hash_folder;
		if(!is_dir($hash_path)) {
			mkdir($hash_path, 0777, true);
		}
		
		$settings = include '../data/settings.php';
		$print_format = $settings['print_format'];
		
		$path = $hash_path.$index.'-'.$selected_orientation.'.' . $print_format;
		
    	//find the real width and height in mm
    	$product = Yaml::parse(file_get_contents('../data/products/'.$product.'.yml'));

    	$dims = [];
    	foreach($product['orientations'] as $orientation) {
    		if($orientation['name'] == $selected_orientation) {
				$dims = $orientation;
				break;
    		}
    	}
		
		$this->printable_width = ($dims['printable_width'] * $this->dpi)/25.4;
		$this->printable_height = ($dims['printable_height'] * $this->dpi)/25.4;
		
		if(!file_exists($path)) {
			if($print_format == 'svg') {
				file_put_contents ( $path, $post['svg']);
			} else {
				//if html5 we use high_res_img
				$this->convertHiRes($post['high_res_img'], $dims, $path);
			}
		}
		
		echo json_encode(['path' => $path]);

	}
	
	public function postNote() {
		$json = file_get_contents('php://input');
		$post = json_decode($json, true);

		$id = $post['id'];		
    	$notes = $post['notes'];
    	$payment_status = $post['payment_status'];
    	$fulfillment_status = $post['fulfillment_status'];
		
		$dispatched = 0;
		if($fulfillment_status == 'shipped') {
			$dispatched = 1;
		}		
		if($fulfillment_status == 'ready_for_pickup') {
			$dispatched = 1;
		}
		
		$order = Order::find($id);
		$order->notes = $notes;
		$order->payment_status = $payment_status;
		$order->fulfillment_status = $fulfillment_status;
		
		$error = '';
		if($dispatched && !$order->dispatched) {
			$order->dispatched = $dispatched;
			$order->dispatched_on = Carbon::now();			
			
			//send an email
			$settings = include '../data/settings.php';
			$mail = new MyMailer;
			#$mail->isSendmail();
			$mail->setFrom($settings['email'], $settings['site_name']);	//Set who the message is to be sent from
			$mail->addAddress($order->email, $order->firstname .' '. $order->lastname); //Set who the message is to be sent to
			$mail->Subject = 'Your '.$settings['site_name'].' order';
			$message = file_get_contents('../data/emails/order_dispatched.txt');
			if($order->fulfillment_status == 'ready_for_pickup') {
				$message = file_get_contents('../data/emails/order_pickup.txt');
			}
			$message = str_replace("{name}", $order->firstname .' '. $order->lastname, $message);
			$message = str_replace("{transaction_id}", $order->id, $message);
			$message = str_replace("{site_name}", $settings['site_name'], $message);
			$mail->Body = $message;
			if(!$mail->send()) {
				#echo 'Message could not be sent.';
				$error = 'Mailer Error: ' . $mail->ErrorInfo;
			} else {
				#echo 'Message has been sent';
			}
		
		}
		$order->save();
		
		echo json_encode(['status' => true, 'error' => $error]);
		
	}	
	
	public function getDelete() {

		$id = (int) $_GET['id'];		
		
		$order = Order::find($id);
		$order->delete();
		redirect_to('orders', array('success' => "Order deleted"));
		die();
		
	}


}


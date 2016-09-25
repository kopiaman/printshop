<?php
	
/**
 *  This file wraps everything together
 *  It connects to your database
 *  and creates the tables needed  
 *  
 */

require __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config.php';
#error_reporting(E_ALL);
#ini_set('display_errors', true);


use Illuminate\Database\Capsule\Manager as Capsule;  
use Illuminate\Database\Query\Expression as raw;

use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;

$capsule = new Capsule;
$connection = get_database_connection();

$capsule->addConnection($connection);
if($connection['driver'] == 'sqlite') {
	$db = new SQLite3($connection['database']); //init the db
}

// Set the event dispatcher used by Eloquent models... (optional)
$capsule->setEventDispatcher(new Dispatcher(new Container));

$capsule->setAsGlobal();

$capsule->bootEloquent();

//make sure the table is created
$schema = Capsule::schema();
$builder = $schema->getConnection()->getSchemaBuilder();

//automatically create the requireed table
if (!$builder->hasTable('orders')) {

	$builder->create('orders', function($table)
	{
		$table->increments('id');
	
		$table->string('firstname')->nullable();
		$table->string('lastname')->nullable();
		$table->string('email')->nullable();
		$table->string('uuid')->nullable();
		$table->string('currency')->nullable();
		$table->decimal('subtotal', 5, 2)->nullable();
		$table->decimal('postage', 5, 2)->nullable();
		$table->decimal('amount', 5, 2)->nullable();
		$table->string('payment_method')->nullable();
		$table->string('token')->nullable();
		$table->longText('payment_meta')->nullable();
		$table->longText('checkout_details')->nullable();
		$table->longText('customer_details')->nullable();
		$table->longText('payment_details')->nullable();
		$table->longText('charge')->nullable();
		$table->string('transaction_id')->nullable();
		$table->longText('cart')->nullable();
		$table->longText('notes')->nullable();
		$table->longText('info')->nullable();
		$table->string('payment_status')->nullable();
		$table->string('fulfillment_status')->nullable();
		$table->longText('activity')->nullable();
		$table->boolean('dispatched')->default(0);
		$table->timestamp('dispatched_on')->nullable();
		$table->boolean('confirmed');
		
		$table->timestamps();
		$table->softDeletes();

	});
	sleep(3);
}

//upgrade
if (!$builder->hasColumn('orders', 'payment_method')) {
	$builder->table('orders', function($table) {
		$table->string('payment_method')->nullable()->after('amount'); // paypal or stripe
		$table->string('token')->nullable()->after('amount'); //paypal/stripe tokens
		$table->longText('payment_meta')->nullable()->after('amount'); //just incase we need to store something
		$table->string('payment_status')->nullable()->after('info'); // paid, cancelled, awaiting payment, refunded
		$table->string('fulfillment_status')->nullable()->after('info'); // Awaiting Processing, Processing, Shipped, Delivered, Will Not Deliver, Returned
		$table->longText('activity')->nullable()->after('info'); // store any activity for the order
	});
	sleep(3); //give it time to update
}

// Create the Orders model 
use Illuminate\Database\Eloquent\SoftDeletingTrait;

class Order extends Illuminate\Database\Eloquent\Model {
    use SoftDeletingTrait;
}

// Sets up the mailer
class MyMailer extends PHPMailer {
	public function __construct() {
		parent::__construct();
		
		//you can either use SMTP
		/*
		$this->IsSMTP(); // telling the class to use SMTP
		$this->SMTPAuth   = true;                  // enable SMTP authentication
		$this->Host       = "mail.yourdomain.com"; // sets the SMTP server
		$this->Username   = "yourname@yourdomain"; // SMTP account username
		$this->Password   = "yourpassword";        // SMTP account password
		*/
		
		//SendMail
		//$this->IsSendmail();  // tell the class to use Sendmail
		
		//Or by default PHP's mail() function
		//no setting
	}
}


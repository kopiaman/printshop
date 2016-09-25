<?php
use Carbon\Carbon;
use Illuminate\Database\Query\Expression as raw;

class DashboardController extends BaseController
{
	public function __construct() {
		parent::__construct();
		$this->data['section'] = 'dashboard';
	}
		
    public function index() {
		
		$dashboard = [];
		$dashboard['orders_this_month'] = Order::where('created_at', '>=', Carbon::now()->startOfMonth())->where('payment_status', 'paid')->count();
		$dashboard['undispatched_orders'] = Order::where('dispatched', 0)->where('payment_status', 'paid')->where('confirmed', 1)->count();

		$last_order = Order::where('confirmed', 1)->orderBy('created_at', 'desc')->first();
		if($last_order) {
			$dashboard['last_order_time'] = $last_order->created_at->diffForHumans();
			$dashboard['last_order_amount'] = number_format($last_order->amount, 2);
		} else {
			$dashboard['last_order_time'] = 'n/a';
			$dashboard['last_order_amount'] = 'n/a';
		}
		$this->data['dashboard'] = $dashboard;


		$todayMinusOneWeekAgo = Carbon::today()->subWeek();
		$chartDatas = Order::select([
    				new raw('DATE(created_at) AS date'),
    				new raw('SUM(amount) AS count'),
 				])
				->where('created_at', '>=', $todayMinusOneWeekAgo)
				->where('payment_status', 'paid')
				->groupBy('created_at')
				->orderBy('created_at', 'ASC')
				->get();
		
		$chartDataByDay = array();
		foreach($chartDatas as $data) {
		    $chartDataByDay[$data->date] = $data->count;
		}
		
		$date = new Carbon;
		for($i = 0; $i < 7; $i++) {
		    $dateString = $date->format('Y-m-d');
		    
		    if(!isset($chartDataByDay[ $dateString ])) {
		        $chartDataByDay[ $dateString ] = 0;
		    }
		    $date->subDay();
		}	
		ksort($chartDataByDay);
		
		$this->data['sales_per_day'] = $chartDataByDay;
		$this->data['start_day'] = $todayMinusOneWeekAgo;

		echo $this->view->render('dashboard.tpl.php', $this->data);
	}
	
}
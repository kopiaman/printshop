@extend('layout.tpl.php')

@block('content')

<div class="row text-center">


	<div class="col-md-3">
		<h3><?= $dashboard['orders_this_month'] ?></h3>
		<p>Orders this month</p>
	</div>	

	<div class="col-md-3">
		<h3><?= $dashboard['undispatched_orders'] ?></h3>
		<p>Undispatched orders</p>
	</div>

	<div class="col-md-3">
		<h3><?= $dashboard['last_order_time'] ?></h3>
		<p>Last order time</p>
	</div>	

	<div class="col-md-3">
		<h3><?= $dashboard['last_order_amount'] ?> <?= $currency ?></h3>
		<p>Last order amount</p>
	</div>	

</div>
<hr />
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
<script type="text/javascript">
  google.load("visualization", "1.1", {packages:["bar"]});
  google.setOnLoadCallback(drawChart);
  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Day', 'Sales'],
      <? $count = 0 ; ?>
      <? foreach($sales_per_day as $day => $sales) : ?>
      <? $day_label = date("d M", strtotime($day)); ?>
['<?= $day_label ?>',  <?= $sales ?>]<?= ($count == 7)?"\n":",\n" ?>
      <? $count++ ; ?>
      <? endforeach; ?>
    ]);
var formatter = new google.visualization.NumberFormat({pattern: '#,###.00'});

   formatter.format(data, 1);  
	var options = {
		chart: {
            subtitle: ' ',
        },
		legend: { position: 'none' }
	};
    var chart = new google.charts.Bar(document.getElementById('chart_div'));

    chart.draw(data, options);
  }
  
</script>

<br />
<div class="row">


  <div class="col-md-12">

    <div class="panel panel-default">
        <div class="panel-heading">Sales performance this week</div>
        <div class="panel-body" style="padding: 0">
			<div style="padding: 15px">
			  
			  <div id="chart_div" style="width: 100%; height: 400px;"></div>

			</div>
        </div>
    </div>

  </div>  


</div>
<br />
<hr />
<br />

<div class="row">


  <div class="col-md-4">

    <div class="well">
        <h4 style="margin: 0; padding: 0;">View orders</h4><br />

      <div class="row">
        <div class="col-md-8">
            <p>Print and process all orders placed</p>
        </div>      
        <div class="col-md-4">
            <a href="<?= site_url('orders') ?>" class="btn btn-primary">Go</a>
        </div>
      </div>
    </div>

  </div>  

  <div class="col-md-4">

    <div class="well">
        <h4 style="margin: 0; padding: 0;">Manage Inventory</h4><br />

      <div class="row">
        <div class="col-md-8">
            <p>Products, variants and categories</p>
        </div>      
        <div class="col-md-4">
            <a href="<?= site_url('products') ?>" class="btn btn-primary">Go</a>
        </div>
      </div>
    </div>

  </div>  

	<div class="col-md-4">

    <div class="well">
        <h4 style="margin: 0; padding: 0;">Manage prices</h4><br />

      <div class="row">
        <div class="col-md-8">
            <p>Set postage and costs per color</p>
        </div>  		
        <div class="col-md-4">
            <a href="<?= site_url('pricing') ?>" class="btn btn-primary">Go</a>
        </div>
      </div>
		</div>

	</div>	


</div>

@endblock
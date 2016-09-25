<!DOCTYPE html>
<html lang="en" ng-app="app" flow-init><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <title>PrintPixel - multiple product designer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

	<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.2/jquery.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.20/angular.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js"></script>
	<script type="text/javascript" src="http://fabricjs.com/lib/fabric.js"></script>
	<script type="text/javascript" src="<?= base_url('js/ng-flow-standalone.min.js') ?>"></script>
	<script type="text/javascript" src="<?= base_url('js/SweetAlert.min.js') ?>"></script>
	<script type="text/javascript" src="<?= base_url('js/sweet-alert.min.js') ?>"></script>
	<script type="text/javascript" src="<?= base_url('js/Blob.js') ?>"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.11.2/ui-bootstrap.min.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.11.2/ui-bootstrap-tpls.min.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/tinycolor/1.0.0/tinycolor.min.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/datatables/1.10.3/js/jquery.dataTables.min.js"></script>
	<script type="text/javascript" src="http://cdn.datatables.net/plug-ins/9dcbecd42ad/integration/bootstrap/3/dataTables.bootstrap.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="<?= base_url('js/angular-money-directive.js') ?>"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/speakingurl/0.20.1/speakingurl.min.js"></script>

	<link type="text/css" rel="stylesheet" href="<?= base_url('js/sweet-alert.css') ?>">
	<?/*<link type="text/css" rel="stylesheet" href="<?= base_url('css/imgareaselect-default.css') ?>">*/?>
	<link type="text/css" rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jquery-jcrop/0.9.12/css/jquery.Jcrop.min.css">
	<link type="text/css" rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/datatables/1.10.3/css/jquery.dataTables.min.css">
	<link type="text/css" rel="stylesheet" href="http://cdn.datatables.net/plug-ins/9dcbecd42ad/integration/bootstrap/3/dataTables.bootstrap.css">
	<link href="<?= base_url('css/bootstrap.css') ?>" rel="stylesheet">
	<link href="<?= base_url('css/theme.css') ?>" rel="stylesheet">

	<script>
	var app = angular.module('app', ['flow', 'oitozero.ngSweetAlert', 'ui.bootstrap', 'fiestah.money'])
    .config(['flowFactoryProvider', function (flowFactoryProvider) {
        flowFactoryProvider.on('catchAll', function (event) {
            console.log('catchAll', arguments);
        });
    }]);
    Array.prototype.moveUp = function(value, by) {
	    var index = this.indexOf(value),     
	        newPos = index - (by || 1);
	     
	    if(index === -1) 
	        throw new Error('Element not found in array');
	     
	    if(newPos < 0) 
	        newPos = 0;
	         
	    this.splice(index,1);
	    this.splice(newPos,0,value);
	};
	 
	Array.prototype.moveDown = function(value, by) {
	    var index = this.indexOf(value),     
	        newPos = index + (by || 1);
	     
	    if(index === -1) 
	        throw new Error('Element not found in array');
	     
	    if(newPos >= this.length) 
	        newPos = this.length;
	     
	    this.splice(index, 1);
	    this.splice(newPos,0,value);
	};
    </script>
  </head>

  <body>

<div id="main-container" class="container" >
	
          <div class="container nav-container" style="">
      <nav class="navbar navbar-default" role="navigation">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="<?= base_url() ?>"><img src="<?= base_url('css/logo.png') ?>" /></i>  &nbsp;&nbsp;&nbsp;PrintPixel</a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">


      <ul class="nav navbar-nav navbar-right">
        <a href="<?= site_url('auth/logout') ?>" class="btn btn-danger pull-right" style="margin-top: 10px">Logout</a>
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>
          </div>
		  
		  
		  
		
		<div class="row">
			<div class="col-md-3">	
   
		<div class="menu-wrapper">
			
			
			<ul class="menu">
				<li><a href="<?= site_url('') ?>" class="<?= ($section == 'dashboard')?'active':'' ?>"><span><i class="fa fa-desktop"></i></span> Dashboard</a></li>
				<li><a href="<?= site_url('products') ?>" class="<?= ($section == 'products')?'active':'' ?>"><span><i class="fa fa-tags"></i></span> Inventory</a></li>
				<li><a href="<?= site_url('orders') ?>" class="<?= ($section == 'orders')?'active':'' ?>"><span><i class="fa fa-credit-card"></i></span> Orders</a></li>
				<li><a href="<?= site_url('pricing') ?>" class="<?= ($section == 'pricing')?'active':'' ?>"><span><i class="fa fa-usd"></i></span> Pricing</a></li>
				<li><a href="<?= site_url('payment_methods') ?>" class="<?= ($section == 'payment_methods')?'active':'' ?>"><span><i class="fa fa-cc-stripe"></i></span> Payment methods</a></li>
				<li><a href="<?= site_url('settings') ?>" class="<?= ($section == 'settings')?'active':'' ?>"><span><i class="fa fa-cogs"></i></span> Settings</a></li>		
			</ul>
			
			
			
		</div>

                
			</div>	
            
          	<div class="col-md-9">	
          	<div class="content-area">	
			@block('content')
				<p>Parent content.</p>
			@endblock

		      </div>			
		      </div>			
		</div>			

		  
		  
		
		
	</div>
	
	
</div>

<script>
$(document).ready( function() {

	$('.menu').height( $('.content-area').outerHeight() );
	//dirty hack
	setInterval(function(){
		$('.menu').height( $('.content-area').outerHeight() );
	}, 500);
	$('[data-toggle="tooltip"]').tooltip();
});
</script>

</body>
</html>
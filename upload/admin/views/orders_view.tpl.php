@extend('layout.tpl.php')

@block('content')
<? if($imagick_not_installed) : ?>
<div class="alert alert-warning" role="alert">
	<strong>Warning!</strong> ImageMagick is not installed.
</div>
<? endif; ?>
<div ng-controller="OrderController">

	<h3>Order id : <?= $order->id ?></h3>
	<hr />
	<div class="row">
		<div class="col-md-12">
			
			<div class="row">
				<div class="col-md-12">	

			<div class="row">
				<div class="col-md-6">
			
			<div class="well">
					<strong>Order details (<?= $order->payment_method ?>)</strong>				
					<div class="row">
						<div class="col-md-4">Sub-total</div>
						<div class="col-md-4 text-right"><?= number_format($order->subtotal, 2) ?> <?= $order->currency ?></div>
					</div>							
					<div class="row">
						<div class="col-md-4">Postage</div>
						<div class="col-md-4 text-right"><?= number_format($order->postage, 2) ?> <?= $order->currency ?></div>
					</div>			
					<hr />
					<div class="row">
						<div class="col-md-4">Total price</div>
						<div class="col-md-4 text-right"><strong><?= number_format($order->amount, 2) ?> <?= $order->currency ?></strong></div>
					</div>				
				</div>
					

			<? if($customer_details) : ?>
			
		<div class="well">
					<strong>Customer details</strong>
					<div class="row">
						<div class="col-md-4">First name</div>
						<div class="col-md-4"><?= @$customer_details->firstname ?></div>
					</div>					
					<div class="row">
						<div class="col-md-4">Last name</div>
						<div class="col-md-4"><?= @$customer_details->lastname ?></div>
					</div>					
					<div class="row">
						<div class="col-md-4">Email</div>
						<div class="col-md-4"><?= @$customer_details->email ?></div>
					</div>
					<? if($order->transaction_id) : ?>
					<div class="row">
						<div class="col-md-4">TransactionID </div>
						<div class="col-md-6"><?= $order->transaction_id ?></div>
					</div>	
					<? endif; ?>
			</div>
			<? endif; ?>
			</div>
			
				<div class="col-md-6">
				

					<? if($order->dispatched): ?>
					<div class="row">
						<div class="col-md-6">
							<label style="margin-top: 10px">Date dispatched</label>
						</div>						
						<div class="col-md-6">
							<p class="form-control-static"><?= $carbon->parse($order->dispatched_on)->toDayDateTimeString() ?></p>
						</div>
					</div>	
					<? endif; ?>
					<?/*<div class="row">
						<div class="col-md-6">
							<label style="margin-top: 10px">Has been dispatched</label>
						</div>						
						<div class="col-md-6">
							<p class="form-control-static" ng-show="order.dispatched == 1">YES</p>
							<select class="form-control" ng-model="order.dispatched" ng-show="order.dispatched != 1">
								<option value="1">Yes</option>
								<option value="0">No</option>
							</select>
						</div>
					</div>	
					<br />*/?>
					<div class="row">
						<div class="col-md-5">
							<label style="margin-top: 10px">Payment status</label>
						</div>						
						<div class="col-md-7">
							<select class="form-control" ng-model="order.payment_status">
								<option value="paid">Paid</option>
								<option value="cancelled">Cancelled</option>
								<option value="awaiting_payment">Awaiting Payment</option>
								<option value="refunded">Refunded</option>
							</select>							
						</div>
					</div>		
					<br />
					<div class="row">
						<div class="col-md-5">
							<label style="margin-top: 10px">Fullfilment status</label>
						</div>						
						<div class="col-md-7">
							<select class="form-control" ng-model="order.fulfillment_status">
								<option value="awaiting_processing">Awaiting Processing</option>
								<option value="processing">Processing</option>
								<option value="shipped">Shipped</option>
								<option value="ready_for_pickup">Ready for pick-up</option>
								<option value="delivered">Delivered</option>
								<option value="will_not_deliver">Will Not Deliver</option>
								<option value="returned">Returned</option>
							</select>
						</div>
					</div>
					
					<br />
					<div class="row">
						<div class="col-md-12">
							<strong>Notes</strong>
							<textarea class="form-control" ng-model="order.notes"></textarea>
						</div>
					</div>					
					<br />
					<div class="row">
						<div class="col-md-12">
							<a href="" ng-show="savingNotes" class="btn btn-primary btn-sm pull-right">Saving...</a>
							<a href="" ng-hide="savingNotes" ng-click="saveNotes()" class="btn btn-primary btn-sm pull-right">Save</a>
						</div>
					</div>


				</div>
				</div>
					<hr />
								
				<div class="row">
					
					<div class="col-md-12">
						<div class="panel panel-default">
  							<div class="panel-heading">Order items</div>
  								<div class="panel-body">
								<table class="table table-striped">
							      <thead>
							        <tr>
							          <th>Product</th>
							          <th>Qty</th>
							          <th>Price</th>
							          <th>Total</th>
							        </tr>
							      </thead>
							      <tbody>
							      	<?php foreach($cart as $index => $item) : ?>
							        <tr>
							          <td>
							          	<strong><?= $item->product->name ?> (<?= $item->variant->name ?>)</strong><br />
										SKU: <?= @$item->product->SKU ?></strong><br />
										<small>(<?= $item->total_quantity ?> item/s)</small>
							          </td>
							          <td>
							          	<? foreach($item->quantities as $label => $qty) : ?>
											<? if( $qty > 0) : ?>
											<?= $label ?> : <?= $qty ?> <br />
											<? endif; ?>
							          	<? endforeach; ?>
							          </td>
							          <td>
							          	Base price: <?= number_format($item->product->price + $item->variant->additional_price, 2) ?> <?= $order->currency ?><br />
							          	With layers: <?= number_format($item->single_price, 2) ?> <?= $order->currency ?><br />
										<? if($item->discount_rate > 0) : ?>
							          	Discount rate: <?= number_format($item->discount_rate, 2) ?>%
										<? endif; ?>
							          </td>
							          <td>
										  <strong><?= number_format(@$item->total_price-@$item->discount, 2) ?> <?= $order->currency ?></strong><br />
										  <? if($item->discount_rate > 0) : ?>
										  <small>Subtotal: <?= number_format(@$item->total_price, 2) ?> <?= $order->currency ?><br />
										  Discount: <?= number_format($item->discount, 2) ?> <?= $order->currency ?><br /></small>
										  <? endif; ?>
									  </td>
							        </tr>
							        <tr>
							          <td colspan="4">
							          	<div class="row">
							          		<? foreach($item->product->orientations as $orientation) : ?>
							          		<div class="col-md-3 text-center">
							          			 <div class="thumbnail">
													<img src="<?= base_url('../../api/image_ordered.php') ?>?order=<?= $order->id ?>&index=<?= $index ?>&orientation=<?= $orientation->name ?>" alt="Click to download">
													<div class="caption">
														<h3><? $orientation->name ?></h3>
														<p ng-show="!isReady">Please wait...</p>
														<p ng-show="isReady"><a href="" class="" role="button" ng-click="startDownload(<?= $index ?>, '<?= $orientation->name ?>')">Download image</a></p>
													</div>
												</div>
							          			<strong><? $orientation->name ?></strong>
							          		</div>
							          		<? endforeach; ?>
							          	</div>
							          </td>
							        </tr>
							    	<?php endforeach; ?>
							      </tbody>
								</table>
							</div>
						</div>
					</div>

				</div>
					
				</div>		
				</div>		
			
		</div>		
		</div>		
		<hr />
		<div class="row">



			<div class="col-md-6">
			<? if($payment_details || true) : ?>
			
		<div class="well">
			<strong>Payment details</strong>
				
					<? if($order->payment_method == 'stripe') : ?>
					
					<div class="row">
						<div class="col-md-4">Name: </div>
						<div class="col-md-6"><?= $payment_details->card->name ?></div>
					</div>
										
					<div class="row">
						<div class="col-md-4">Number: </div>
						<div class="col-md-8">**** **** **** <?= $payment_details->card->last4 ?></div>
					</div>		
					
					<div class="row">
						<div class="col-md-4">Expires: </div>
						<div class="col-md-6"><?= $payment_details->card->exp_month ?> / <?= $payment_details->card->exp_year ?></div>
					</div>
										
					<div class="row">
						<div class="col-md-4">Type: </div>
						<div class="col-md-6"><?= $payment_details->card->brand ?> <?= $payment_details->card->funding ?></div>
					</div>
					<div class="row">
						<div class="col-md-4">Country: </div>
						<div class="col-md-6"><?= $payment_details->card->country ?></div>
					</div>
					<? elseif($order->payment_method == 'bank_transfer'): ?>
					<div class="row">
						<div class="col-md-4">Type: </div>
						<div class="col-md-6">Bank transfer</div>
					</div>
					<? elseif($order->payment_method == 'paypal_express_checkout'): ?>
					<div class="row">
						<div class="col-md-4">Payer name: </div>
						<div class="col-md-6"><?= implode(" ", array_values( (array) $payment_details->GetExpressCheckoutDetailsResponseDetails->PayerInfo->PayerName)) ?></div>
					</div>						
					<div class="row">
						<div class="col-md-4">Payer email: </div>
						<div class="col-md-6"><?= $payment_details->GetExpressCheckoutDetailsResponseDetails->PayerInfo->Payer ?></div>
					</div>			
					<div class="row">
						<div class="col-md-4">TransactionID: </div>
						<div class="col-md-6"><?= $order->transaction_id ?></div>
					</div>	
					<? else: ?>
					<div class="row">
						<div class="col-md-4">Type: </div>
						<div class="col-md-6"><?= $order->payment_method ?></div>
					</div>
					<? endif; ?>

			</div>
			<? endif; ?>	

			</div>
			
						<div class="col-md-6">
					<div class="well">
					<strong>Shipping details</strong>
					<div class="row">
						<div class="col-md-12">
						<?= @$customer_details->address1 ?><br />
						<?= @$customer_details->address2 ?><br />
						<?= @$customer_details->city ?><br />
						<?= @$customer_details->state ?><br />
						<?= @$customer_details->zip ?><br />
						<?= @$customer_details->country->name ?><br />
						</div>
					</div>	
			</div>
			</div>
			

			</div>

		</div>
	</div>
</div>
<script>
    var canvas = null;
</script>

<script>
(function(c){var b,d,e,f,g,h=c.body,a=c.createElement("div");a.innerHTML='<span style="'+["position:absolute","width:auto","font-size:128px","left:-99999px"].join(" !important;")+'">'+Array(100).join("wi")+"</span>";a=a.firstChild;b=function(b){a.style.fontFamily=b;h.appendChild(a);g=a.clientWidth;h.removeChild(a);return g};d=b("monospace");e=b("serif");f=b("sans-serif");window.isFontAvailable=function(a){return d!==b(a+",monospace")||f!==b(a+",sans-serif")||e!==b(a+",serif")}})(document);
		
var cart = <?= json_encode($cart); ?>;
var fonts_required = <?= json_encode($fonts_required); ?>;
var print_format = '<?= $print_format; ?>';
function OrderController($scope, $http, $q, $interval, $modal) {
	window.scope = $scope;
	$scope.designerWidth = 460;
	$scope.designerHeight = 460;
	$scope.order = {};
	$scope.order.id = <?= $order->id ?>;
	$scope.order.dispatched = <?= $order->dispatched ?>;
	$scope.order.payment_status = '<?= $order->payment_status ?>';
	$scope.order.fulfillment_status = '<?= $order->fulfillment_status ?>';
	$scope.order.notes = '<?= $order->notes ?>';
	
	$scope.fonts_loaded = [];
	$scope.preloadFonts = function(){
    	var deferred = $q.defer();

		var self = this;
		
		if(_.size(fonts_required) == 0) {
			deferred.resolve($scope.fonts_loaded);
		}

    	_.each(fonts_required, function(font) {
			console.log(font);
			if (!isFontAvailable(font.regular.fontface)) {

				$('head').append('<link rel="stylesheet" type="text/css" href="<?= base_url('') ?>../../data/'+font.regular.stylesheet+'">');
				console.log("loading " + font.regular.stylesheet, font);
				var stop = $interval(function() {
					if (isFontAvailable(font.regular.fontface)) {
						console.log("loaded " + font.regular.fontface);
						$scope.fonts_loaded.push(font.regular.fontface);
						if(_.size($scope.fonts_loaded) == _.size(fonts_required)) {
							deferred.resolve($scope.fonts_loaded);
						}
						$interval.cancel(stop);
					}
				}, 100);
				
			}
			
		});
		
		return deferred.promise;
	};
	
	$scope.savingNotes = false;
	$scope.saveNotes = function() {
		$scope.savingNotes = true;
		$http.post('<?= site_url("orders/save") ?>', $scope.order).
			success(function(data, status, headers, config) {
				$scope.savingNotes = false;
				$scope.order.dispatched = 1;
				if(data.error != "") {
					swal("Mailing error", data.error);
				}
			}).
			error(function(data, status, headers, config) {
				$scope.savingNotes = false;
			});
	};
	
	$scope.downloadImage = function(params) {
		$http.post('<?= site_url("orders/print") ?>', params).
		success(function(data, status, headers, config) {
			if(!data.path) {
				alert(data);	
			} else {
				$('.sweet-alert .confirm').show();
				$scope.currentPath = '../' + data.path;
			}
		}).
		error(function(data, status, headers, config) {
			alert(data);
		});
	};
	
	$scope.currentPath = "";
	$scope.startDownload = function(index, orientation) {
		
		//open a modal and show the canvas
		var modalInstance = $modal.open({
			templateUrl: '<?= base_url('views/print.html') ?>',
			controller: 'PrintController',
			size: 'lg',
			resolve: {
				index: function () {
					return index;
				},
				orientation: function () {
					return orientation;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
		
		return false;
		
		$scope.currentPath = "";
		swal({
			title: "Processing image..",
			text: "This may take 15 to 60 seconds...",
			confirmButtonText: "Download"
		}, function(){ 
			window.location.href = $scope.currentPath;
		});
		
		$('.sweet-alert .confirm').hide();
		setTimeout(function () {
			$scope.setCanvas(index, orientation);
		}, 1000);
	};
	
	$scope.setCanvas = function(index, orientation) {


		canvas.clear();
        var item = jQuery.extend(true, {}, cart[index]);
		var dims = _.find(cart[index].product.orientations, {name:orientation});

		var ratio = $scope.designerWidth/dims.width;
		$scope.selectedOrientationDimensions = {};
		$scope.selectedOrientationDimensions.width = ratio * dims.width;
        $scope.selectedOrientationDimensions.height = ratio * dims.height;
        $scope.selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
        $scope.selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
        $scope.selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
        $scope.selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;
		
		canvas.setWidth($scope.selectedOrientationDimensions.printableWidth);
		canvas.setHeight($scope.selectedOrientationDimensions.printableHeight);

		canvas.loadFromJSON(item.canvases[orientation], canvas.renderAll.bind(canvas));
		canvas.renderAll();
return;
		var dpi = 300;
		var printable_width = (dims.printable_width * dpi)/25.4;
		var printable_height = (dims.printable_height * dpi)/25.4;
		var unratio = dims.width / $scope.designerWidth;
		var multiplier = (printable_width/dims.printable_width) * unratio;
		
		var high_res_img = new Image;
		var params = {
			product: cart[index].product.slug,
			orientation: orientation,
			order_id:<?= $order->id ?>,
			index:index
		};

		high_res_img.onload = function(test){
			params.high_res_img = high_res_img.src;
			if(print_format == 'svg') {
				params.svg = canvas.toSVG();
			}
			$scope.downloadImage(params);
		};
		
		setTimeout(function () {
			high_res_img.src = canvas.toDataURLWithMultiplier('png', multiplier, 1);		
		}, 3000);


	};

	$scope.isReady = false;
    $scope.init = function() {
		
		$scope.preloadFonts().then(function() {
			$scope.isReady = true;
		});
		
    };

    $scope.init();
}

app.controller('PrintController', function ($scope, $modalInstance, $http, index, orientation) {

	$scope.index = index;
	$scope.orientation = orientation;
  	$scope.designerWidth = 460;
	$scope.designerHeight = 460;
  
	$scope.init = function () {
		console.log('init');
		canvas = new fabric.Canvas('printableArea');
		setTimeout(function () {
			$scope.setCanvas(index, orientation);
		}, 1000);
	};
	
	$scope.getBase64Image = function(img) {
		var canvas = document.createElement("canvas");
		var data = atob( img.substring( "data:image/png;base64,".length ) ),
			asArray = new Uint8Array(data.length);

		for( var i = 0, len = data.length; i < len; ++i ) {
			asArray[i] = data.charCodeAt(i);    
		}
		return asArray.buffer;
	}
	
	$scope.printPNG = function() {
		var dpi = 300;
		var dims = _.find(cart[index].product.orientations, {name:orientation});
		var printable_width = (dims.printable_width * dpi)/25.4;
		var printable_height = (dims.printable_height * dpi)/25.4;
		var unratio = dims.width / $scope.designerWidth;
		var multiplier = (printable_width/dims.printable_width) * unratio;
		console.log(dims);
		var file = canvas.toDataURLWithMultiplier('png', multiplier, 1);
		file = $scope.getBase64Image(file);
	
		var blob = new Blob([file], {type: "image/png;charset=utf-8"});
		saveAs(blob, "<?= $order->id ?>-"+index+"-"+orientation+".png");
	};		
	
	$scope.downloadUserElements = function() {
		var params = {
			product: cart[index].product.slug,
			orientation: orientation,
			order_id:<?= $order->id ?>,
			index:index
		};
		$http.post('<?= site_url("orders/download") ?>', params).
		success(function(data, status, headers, config) {
			//console.log(data);
			if(data.status == true) {
				window.location.href = '<?= base_url('') ?>../'+data.path;
			} else {
				alert(data.msg);
			}
		}).
		error(function(data, status, headers, config) {
			alert(data);
		});
		
	};
		
	$scope.printingPDF = false;
	$scope.printPDF = function() {
		
		$scope.printingPDF = true;
		var high_res_img = new Image;
		var params = {
			product: cart[index].product.slug,
			orientation: orientation,
			order_id:<?= $order->id ?>,
			index:index
		};
		
		var dpi = 300;
		var dims = _.find(cart[index].product.orientations, {name:orientation});
		var printable_width = (dims.printable_width * dpi)/25.4;
		var printable_height = (dims.printable_height * dpi)/25.4;
		var unratio = dims.width / $scope.designerWidth;
		var multiplier = (printable_width/dims.printable_width) * unratio;
		
		var file = canvas.toDataURLWithMultiplier('png', multiplier, 1);
		var params = {
			product: cart[index].product.slug,
			orientation: orientation,
			order_id: <?= $order->id ?>,
			index: index
		};
		params.high_res_img = file;
		$http.post('<?= site_url("orders/print") ?>', params).
		success(function(data, status, headers, config) {
			if(data.status == true) {
				window.location.href = '<?= base_url('') ?>../'+data.path;
			} else {
				alert(data);
			}
			$scope.printingPDF = false;
		}).
		error(function(data, status, headers, config) {
			$scope.printingPDF = false;
			alert(data);
		});
		
	};
	
	$scope.printSVG = function() {
		var file = canvas.toSVG();
		
		var fonts_str = "<defs>\n";
		var url = window.location.protocol + '//' + window.location.hostname + '/data/';
		fonts_str += "<style>\n";
		_.each(fonts_required, function(font) {
			console.log(font);
			fonts_str += "@@font-face {\n";
			fonts_str += "\tfont-family:"+font.regular.fontface+";\n";
			fonts_str += "\tsrc: url('"+url+font.regular.ttf.replace('ttf', 'woff')+"');\n";
			fonts_str += "\n}\n";
		});
		fonts_str += "</style>\n";
		file = file.replace("<defs>", fonts_str);
		console.log(file);
		var blob = new Blob([file], {type: "image/svg+xml;charset=utf-8"});
		saveAs(blob, "<?= $order->id ?>-"+index+"-"+orientation+".svg");
	};
	
	$scope.setCanvas = function(index, orientation) {
		canvas = new fabric.Canvas('printableArea');
		//canvas.clear();
        var item = jQuery.extend(true, {}, cart[index]);
		var dims = _.find(cart[index].product.orientations, {name:orientation});

		var ratio = $scope.designerWidth/dims.width;
		$scope.selectedOrientationDimensions = {};
		$scope.selectedOrientationDimensions.width = ratio * dims.width;
        
		$scope.selectedOrientationDimensions.height = ratio * dims.height;
        $scope.selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
        $scope.selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
        $scope.selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
        $scope.selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;
		
		canvas.setWidth($scope.selectedOrientationDimensions.printableWidth);
		canvas.setHeight($scope.selectedOrientationDimensions.printableHeight);

		console.log('dims', $scope.designerWidth, item.canvases[orientation]);
		canvas = new fabric.Canvas('printableArea');
		canvas.loadFromJSON(item.canvases[orientation], canvas.renderAll.bind(canvas));

		canvas.renderAll();
	};
	
	$scope.ok = function () {
		$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.init();

});

</script>
	
@endblock
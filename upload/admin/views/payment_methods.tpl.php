@extend('layout.tpl.php')

@block('content')
<style>
	.control-label {
		font-weight: normal;
	}
</style>
<h3>Payment methods</h3><br /><br />
<form role="form" class="form-horizontal ng-pristine ng-valid" action="#" method="POST" ng-controller="PaymentMethodsController">
	<div class="row">
		<div class="col-md-1">
			<i class="fa fa-cc-stripe fa-3" style="font-size: 34px;"></i>
		</div>
		<div class="col-md-6" ng-class="{'payment-selected':paymentMethods.stripe.status}">
			Stripe (recommended) &nbsp;&nbsp;&nbsp;<a href="" ng-show="paymentMethods.stripe.status == 1" ng-click="paymentMethods.stripe.status = 0" class="real-link">Disable</a><a href="" ng-show="paymentMethods.stripe.status == 0" ng-click="paymentMethods.stripe.status = 1" class="real-link">Enable</a>
		</div>			
		<div class="col-md-2 pull-right">
			<div class="status-enabled" ng-show="paymentMethods.stripe.status == 1"><i class="fa fa-check"></i>&nbsp;&nbsp;Enabled</div>
			<div class="status-disabled" ng-show="paymentMethods.stripe.status == 0"><i class="fa fa-circle"></i>&nbsp;&nbsp;Disabled</div>
		</div>	
	</div>		
	<div class="row">
		<div class="col-md-11 col-md-offset-1">
			
			<div class="row">
				<div class="col-md-12">
					<div class="form-group">
						<label class="col-sm-3 control-label">Stripe secret key</label>
						<div class="col-sm-6">
							<input type="text" class="form-control" ng-model="paymentMethods.stripe.secret_key" name="stripe_secret_key">
						</div>
					</div>			
					<div class="form-group">
						<label class="col-sm-3 control-label">Stripe publishable key</label>
						<div class="col-sm-6">
							<input type="text" class="form-control" ng-model="paymentMethods.stripe.publishable_key" name="stripe_secret_key">
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>
	<hr />


	<div class="row">
		<div class="col-md-1">
			<i class="fa fa-cc-paypal fa-3" style="font-size: 34px;"></i>
		</div>
		<div class="col-md-6" ng-class="{'payment-selected':paymentMethods.paypal_express_checkout.status}">
			PayPal Express Checkout &nbsp;&nbsp;&nbsp;<a href="" ng-show="paymentMethods.paypal_express_checkout.status == 1" ng-click="paymentMethods.paypal_express_checkout.status = 0" class="real-link">Disable</a><a href="" ng-show="paymentMethods.paypal_express_checkout.status == 0" ng-click="paymentMethods.paypal_express_checkout.status = 1" class="real-link">Enable</a>
		</div>			
		<div class="col-md-2 pull-right">
			<div class="status-enabled" ng-show="paymentMethods.paypal_express_checkout.status == 1"><i class="fa fa-check"></i>&nbsp;&nbsp;Enabled</div>
			<div class="status-disabled" ng-show="paymentMethods.paypal_express_checkout.status == 0"><i class="fa fa-circle"></i>&nbsp;&nbsp;Disabled</div>
		</div>	
	</div>
	
	<div class="row">
		<div class="col-md-11 col-md-offset-1">
			
			<div class="row">
				<div class="col-md-12">
					<div class="form-group">
						<label class="col-sm-3 control-label">Paypal UserName</label>
						<div class="col-sm-6">
							<input type="text" class="form-control" ng-model="paymentMethods.paypal_express_checkout.paypal_username">
						</div>
					</div>			
					<div class="form-group">
						<label class="col-sm-3 control-label">Paypal Password</label>
						<div class="col-sm-6">
							<input type="text" class="form-control" ng-model="paymentMethods.paypal_express_checkout.paypal_password">
						</div>
					</div>					
					<div class="form-group">
						<label class="col-sm-3 control-label">Paypal Signature</label>
						<div class="col-sm-6">
							<input type="text" class="form-control" ng-model="paymentMethods.paypal_express_checkout.paypal_signature">
						</div>
					</div>					
					<div class="form-group">
						<label class="col-sm-3 control-label">Paypal environment</label>
						<div class="col-sm-6">
							<select class="form-control" ng-model="paymentMethods.paypal_express_checkout.paypal_environment" ng-options="choice for choice in paypalEnvironments"></select>
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>
	
	<hr />

	<div class="row">
		<div class="col-md-1">
			<i class="fa fa-bank fa-3" style="font-size: 34px;"></i>
		</div>
		<div class="col-md-6" ng-class="{'payment-selected':paymentMethods.bank_transfer.status}">
			Bank transfer &nbsp;&nbsp;&nbsp;<a href="" ng-show="paymentMethods.bank_transfer.status == 1" ng-click="paymentMethods.bank_transfer.status = 0" class="real-link">Disable</a><a href="" ng-show="paymentMethods.bank_transfer.status == 0" ng-click="paymentMethods.bank_transfer.status = 1" class="real-link">Enable</a>
		</div>			
		<div class="col-md-2 pull-right">
			<div class="status-enabled" ng-show="paymentMethods.bank_transfer.status == 1"><i class="fa fa-check"></i>&nbsp;&nbsp;Enabled</div>
			<div class="status-disabled" ng-show="paymentMethods.bank_transfer.status == 0"><i class="fa fa-circle"></i>&nbsp;&nbsp;Disabled</div>
		</div>	
	</div>
	<div class="row">
		<div class="col-md-11 col-md-offset-1">
			
			<div class="row">
				<div class="col-md-12">
					<div class="form-group">
						<label class="col-sm-3 control-label">Title</label>
						<div class="col-sm-6">
							<input type="text" class="form-control" ng-model="paymentMethods.bank_transfer.title">
						</div>
					</div>			
					<div class="form-group">
						<label class="col-sm-3 control-label">Payment instructions</label>
						<div class="col-sm-6">
							<textarea class="form-control" rows="6" ng-model="paymentMethods.bank_transfer.instructions">
Dear $username, <br /><br />
Please send us a payment in the amount of $currency_sign$amount for $item_name<br />

Your transaction reference number is $payment_id. <br /><br />

Thank you!
</textarea>
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>
	<br />
		<div class="row">
		<div class="col-md-11 col-md-offset-1">
			
			<div class="row">
				<div class="col-md-12">		
					<div class="form-group">
						<label class="col-sm-3 control-label">&nbsp;</label>
						<div class="col-sm-6">
							
							<button type="button" class="btn btn-primary pull-right" ng-click="savePaymentMethods()" ng-hide="saving">Save payment methods</button>
							<button type="button" class="btn btn-primary pull-right" ng-show="saving">Saving...</button>
		
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>

<br /><br />

<script>
var paymentMethods = <?= json_encode($payment_methods) ?>;
</script>
<script>
function PaymentMethodsController($scope, $http, SweetAlert, $modal) {
	window.scope = $scope;
	$scope.form = {};
	$scope.paypalEnvironments = ['sandbox', 'live'];
	$scope.saving = false;
	
	$scope.init = function() {
        $scope.paymentMethods = paymentMethods;
    };
	$scope.savePaymentMethods = function() {
            $scope.saving = true;
            $http.post('<?= site_url("payment_methods/save") ?>', $scope.paymentMethods).
            success(function(data, status, headers, config) {
              // this callback will be called asynchronously
              // when the response is available
              if(data.status) {
                $scope.saving = false;
                SweetAlert.swal("Saved...", "Successfully saved!", "success");
            }

        }).
		error(function(data, status, headers, config) {
		  // called asynchronously if an error occurs
		  // or server returns response with an error status.
		  $scope.saving = false;
		});
    };
	$scope.init();
};
</script>


@endblock
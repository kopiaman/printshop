@extend('layout.tpl.php')

@block('content')

<h3>Pricing</h3>
<p>Edit your pricing</p><hr /><br />
<? if(isset($_SESSION['success'])) : ?>
    <div class="alert alert-success" role="alert"><?= $_SESSION['success'] ?></div>   
<? endif; ?>
  
<? if(isset($_SESSION['error'])) : ?>
    <div class="alert alert-danger" role="alert"><?= $_SESSION['error'] ?></div>   
<? endif; ?>

<div ng-controller="PricingController">
    
    <form role="form" action="<?= site_url('settings/save') ?>" method="POST">
        
      <div class="row">
		<div class="col-md-12"><h5><i class="fa fa-chevron-right"></i> Bulk discounts</h5></div>
          <div class="col-md-12">
			  <table class="table table-bordered table-pricing">
			  <tbody>
				<tr>
				  <th scope="row">Quantity from</th>
				  <td ng-repeat="(bulk_key, bulk_discount) in bulk_discounts">
					  <input type="text" class="input-pricing" name="bulk_discount[{bulk_key}]['from']" ng-model="bulk_discount.from" ng-change="changeBulkLimits(bulk_key)" maxlength="4" />
				  </td>
				</tr>				
				<tr>
				  <th scope="row">Quantity to</th>
				  <td ng-repeat="bulk_discount in bulk_discounts">
					  <input type="text" class="input-pricing" disabled ng-model="bulk_discount.to" maxlength="4" />
				  </td>
				</tr>					
				<tr>
				  <th scope="row">Discount (%)</th>
				  <td ng-repeat="bulk_discount in bulk_discounts">
					  <input type="text" class="input-pricing" name="bulk_discount[{bulk_key}]['discount']" ng-model="bulk_discount.discount" maxlength="4" />
				  </td>
				</tr>

			  </tbody>
			</table>
			 <em>Note: Leave the "Quantity from" value empty to ignore.</em>
		</div>
	  </div>
	  <br />
	  
	  <br />        
	  <br />        
      <div class="row">
		<div class="col-md-12"><h5><i class="fa fa-chevron-right"></i> Pricing per additional side (e.g. front, back)</h5></div>
          <div class="col-md-12">
			  <table class="table table-bordered table-pricing">
			  <tbody>
				<tr>
				  <th scope="row"></th>
				  <th scope="row" colspan="6" class="text-center">Number of additional sides to print</th>
				</tr>			
				<tr>
					<th scope="row"></th>
					<? foreach($pricing['charges_per_side'] as $value) : ?>
					<td class="text-center"><?= $value['sides'] ?></td>
					<? endforeach; ?>
				</tr>				
				<tr>
				  <th scope="row">Extra charge (<?= $currency ?>)</th>
				  <td ng-repeat="charge in charges_per_side" class="text-center">
					<input type="text" class="input-pricing" ng-model="charge.price" money maxlength="4" />
				  </td>
				</tr>
			  </tbody>
			</table>
			 
		</div>
	  </div>
	  <br />
	  	  <br />    
	  <br />
      <div class="row">
          <div class="col-md-2"><h5><i class="fa fa-chevron-right"></i> Colors cost</h5></div>
          
          <div class="col-md-8">

                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th class="col-md-4">Colors per side</th>
                      <th class="col-md-5">Cost</th>
                      <th class="col-md-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr ng-repeat="(color_key, num_colors) in color_pricing">
                        <td><p class="form-control-static"><span ng-hide="$last">{{color_key}} colors</span><span ng-show="$last">{{$index+1}}+ colors and photos</span></p></td>
                        <td>
                          <div class="input-group">
                            <input type="text" money min="0" max="9999" step="0.01" size="4" class="form-control text-right" ng-model="color_pricing[color_key]"/>
                            <span class="input-group-addon"><?= $currency ?></span>
                          </div>
                        </td>
                        <td>
                            <a ng-show="$last" href="" class="btn btn-primary btn-sm" ng-click="removeColor()" ><i class="fa fa-minus"></i></a>
                            <a ng-show="$last" href="" class="btn btn-primary btn-sm" ng-click="addColor()" ><i class="fa fa-plus"></i></a>
                        </td>
                    </tr>
                  </tbody>
                </table>
              
          </div>
      </div>        
        <br />
        
        <br />
      <div class="row">
          <div class="col-md-2"><h5><i class="fa fa-chevron-right"></i> Postage cost</h5></div>
          
          <div class="col-md-8">
            
                <table class="table table-striped">
                  <thead>
                    <tr>
                        <th class="col-md-4">Delivery type</th>
                        <th class="col-md-5">Cost</th>
                        <th class="col-md-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                      
                    <tr ng-repeat="delivery in delivery_types">
                        <td><input type="text" class="form-control" ng-model="delivery.name" /></td>
                        <td>
                            <div class="input-group">
                              <input type="text" money step="0.01" class="form-control text-right" ng-model="delivery.price" min="0" />
                              <span class="input-group-addon"><?= $currency ?></span>
                            </div>
                        </td>
                        <td>
                            <a href="" class="btn btn-warning btn-sm" ng-click="remove(delivery_types, $index)" ><i class="fa fa-minus"></i></a>
                            <a ng-show="$last" href="" class="btn btn-primary btn-sm" ng-click="addDeliveryType()" ><i class="fa fa-plus"></i></a>
                        </td>
                    </tr>
                      
                  </tbody>
                </table>
              
              
          </div>
      </div>
        <br />
        <br />
              <div class="row">
          <div class="col-md-2"></div>
          
          <div class="col-md-8">
                <button type="button" class="btn btn-primary pull-right" ng-click="save()" ng-hide="saving">Save pricing</button>
                <button type="button" class="btn btn-primary pull-right" ng-show="saving">Saving...</button>
           </div>
      </div>
    </form>

</div>

<script>
var pricing = <?= json_encode($pricing); ?>;
function PricingController($scope, $http, SweetAlert) {
	window.scope = $scope;

    $scope.bulk_discounts = pricing['bulk_discounts'];
    $scope.charges_per_side = pricing['charges_per_side'];
    $scope.color_pricing = pricing['colors'];
    $scope.delivery_types = pricing['delivery_types'];
    $scope.saving = false;
    
    $scope.changeBulkLimits = function(key) {
		
		if ( $scope.bulk_discounts.hasOwnProperty(key+1) ) {
			$scope.bulk_discounts[key]['to'] = parseInt($scope.bulk_discounts[key+1]['from']) - 1;
		}
		
		if ( $scope.bulk_discounts.hasOwnProperty(key-1) ) {
			$scope.bulk_discounts[key-1]['to'] = parseInt($scope.bulk_discounts[key]['from']) - 1;
		}
		
    };
	
    $scope.addColor = function() {
        $scope.color_pricing[_.size($scope.color_pricing)] = $scope.color_pricing['INF'];
        $scope.color_pricing['INF'] = $scope.color_pricing[_.size($scope.color_pricing)];
    };
    
    $scope.removeColor = function() {
        delete $scope.color_pricing['INF'];
        var last = _.size($scope.color_pricing);
        $scope.color_pricing['INF'] = $scope.color_pricing[last];
        delete $scope.color_pricing[last];
    };    
    $scope.remove = function(array, index){
        array.splice(index, 1);
    }
    $scope.addDeliveryType = function() {
        $scope.delivery_types.push({'name': 'Untitled', price:0.00});
    };
    
    $scope.save = function() {
        $scope.saving = true;
        $http.post('<?= site_url("pricing/save") ?>', {
            bulk_discounts:$scope.bulk_discounts,
            charges_per_side:$scope.charges_per_side,
            colors:$scope.color_pricing,
            delivery_types: $scope.delivery_types
        }).
        success(function(data, status, headers, config) {
            $scope.saving = false;
            SweetAlert.swal("Saved...", "Successfully saved!", "success");
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.saving = false;
        });
    };

    
}
</script>

@endblock
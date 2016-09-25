@extend('layout.tpl.php')

@block('content')
<ul class="nav nav-tabs">
      <li role="presentation"><a href="<?= site_url('products') ?>">Products</a></li>
      <li role="presentation"><a href="<?= site_url('categories') ?>">Categories</a></li>
      <li role="presentation" class="active"><a href="<?= site_url('variants') ?>">Variants</a></li>
    </ul>
<br />
	<h3>Variants</h3>
	<p>Variants are the different colors for each product. E.g. instead of creating a new product for a blue, yellow and white T-shirt, you would set 3 variants.</p><hr />
	<? if(isset($_SESSION['success'])) : ?>
		<div class="alert alert-success" role="alert"><?= $_SESSION['success'] ?></div>		
	<? endif; ?>

<form ng-controller="VariantController" ng-submit="saveVariants()">
      <div  style="max-height: 500px; overflow-x: hidden; overflow-y: scroll;" id="table_variants">

	<table class="table table-condensed">
      <thead>
        <tr>
          <th class="col-md-5">Swatch name</th>
          <th class="col-md-2">HEX 1</th>
          <th class="col-md-2">HEX 2</th>
          <th class="col-md-2">HEX 3</th>
          <th class="col-md-1 text-center">&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="variant in variants" ng-if="variant.hexes.length > 0">
          <td><input type="text" class="form-control form-control-small" placeholder="e.g White/Black" ng-model="variant.name"></td>

          <td ng-repeat="n in [] | range:3">
            <div class="input-group">
              <input type="text" class="form-control form-control-small" ng-model="variant.hexes[n]" ng-required='n == 0'>
              <span class="input-group-addon input-group-addon-color">
                <div style="background:{{getHex(variant, n)}};"></div>
              </span>
            </div>
          </td>

          <td  class="text-center">
				<a href="" ng-click="removeVariant(variant)" class="remove-field"><i class="fa fa-times"></i></a>
          </td>

        </tr>
      </tbody>
    </table>
</div>
<br />
  		<div class="row">
			<div class="col-md-8">
<button type="button" class="btn btn-default add-field-button" ng-click="addVariant()">Add new variant</button>
			</div>
			<div class="col-md-4">
          <button type="submit" class="btn btn-primary pull-right" ng-hide="saving">Save variants</button>
          <button type="button" class="btn btn-primary pull-right" ng-show="saving">Saving...</button>
			</div>
		</div>

</form>


<script>
	var variants = <?= json_encode($variants) ?>;
	
	app.filter('range', function() {
	  return function(input, total) {
	    total = parseInt(total);
	    for (var i=0; i<total; i++)
	      input.push(i);
	    return input;
	  };
	});

    function VariantController($scope, $http, SweetAlert, $q) {
        window.scope = $scope;

        $scope.removeVariant = function(variant) {
            if($scope.variants.length == 1) {
                SweetAlert.swal("Oops...", "You must have at least one variant!", "error");
                return false;
            }
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You will not be able to recover this variant!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            },
            function(){
                var index = $scope.variants.indexOf(variant);
                if (index > -1) {
                    $scope.variants.splice(index, 1);
                    console.log($scope.variants);
                    $scope.$apply();
                    $scope.updateVariants();
                }
            });


        };

        $scope.getHex = function(variant, n) {
            var color = variant.hexes[n];
            var myColor = tinycolor(color);
            if(myColor.isValid()) {
              variant.myHexes[n] = myColor.toHexString();
            } else {
              variant.myHexes[n] = null;
            }
            return myColor.toHexString();
        };

        $scope.addVariant = function() {
            $scope.variants.push({name:'Untitled ' + $scope.variants.length, hexes:['#000000'], myHexes:['#000000']});
            setTimeout(function() {
              $("#table_variants").scrollTop($("#table_variants")[0].scrollHeight);
            }, 100);
        };        


        $scope.saveVariants = function() {
          $scope.saving = true;
          $scope.updateVariants()
          .then(function(result){
            $scope.saving = false;
            SweetAlert.swal("Saved...", "Successfully saved!", "success");
          }, function(error){
            // error
            $scope.saving = false;
          });
        };

        $scope.updateVariants = function() {
            var deferred = $q.defer();
            $http.post('<?= site_url("variants/save") ?>', $scope.variants).
            success(function(data, status, headers, config) {
              // this callback will be called asynchronously
              // when the response is available
              if(data.status) {
                deferred.resolve(true)
              } else {
                deferred.reject(false);
              }
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              deferred.reject(false);
            });
            return deferred.promise;
        };

        $scope.init = function() {
          $scope.variants = variants;
        };
        $scope.init();

    }

</script>

@endblock
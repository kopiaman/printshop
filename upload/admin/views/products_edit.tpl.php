@extend('layout.tpl.php')

@block('content')
<style>
.lifted-corners {
    position: relative;
    width: 460px;
    height: 460px;
    background-color: #fff;
    border: 1px solid #ccc;
    float: left;
    margin-left: 0px;
    -moz-border-radius: 4px;
    -webkit-border-radius: 4px;
    border-radius: 4px;
}

.lifted-corners:before,
.lifted-corners:after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 80%;
    height: 80%;
    max-width: 160px;
    max-height: 60px;
    -webkit-box-shadow:0 15px 7px rgba(0, 0, 0, 0.75);
    -moz-box-shadow:0 15px 7px rgba(0, 0, 0, 0.75);
    box-shadow:0 15px 7px rgba(0, 0, 0, 0.75);
    bottom: 20px;
}

.lifted-corners:before {
    left: 10px;
    -webkit-transform:rotate(-5deg);
    -moz-transform:rotate(-5deg);
    -ms-transform:rotate(-5deg);
    -o-transform:rotate(-5deg);
    transform:rotate(-5deg);
}

.lifted-corners:after {
    right: 10px;
    -webkit-transform:rotate(5deg);
    -moz-transform:rotate(5deg);
    -ms-transform:rotate(5deg);
    -o-transform:rotate(5deg);
    transform:rotate(5deg);
}

</style>

<h3>Edit product</h3>
<hr /><br />

<form role="form" ng-controller="ProductController">
    <div class="form-group">
        <div class="row">
            <div class="col-sm-8">
                <label>Product name</label>
                <input type="product" class="form-control" ng-model="form.name" name="name">
            </div>  
            <div class="col-sm-4">
                <label>Price</label>
                <div class="input-group">
                    <input type="text" class="form-control" ng-model="form.price" name="price">
                    <span class="input-group-addon"><?= $currency ?></span>
                </div>
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="row">
            <div class="col-sm-8">
                <label>Category</label>
                <select class="form-control" name="category" ng-model="form.category">
                    <? foreach($categories as $category) : ?>
                    <option><?= $category['name'] ?></option>
                    <? endforeach; ?>
                </select>
            </div>  
            <div class="col-sm-4">
                <label>Category position</label>
                <input type="text" class="form-control" ng-model="form.position">
            </div>
        </div>
    </div>  
<div class="form-group">
    <label>Description</label>
    <textarea class="form-control" rows="8" ng-model="form.description"></textarea>
</div>

<hr />
<div class="panel panel-default">
  <div class="panel-heading">Orientations</div>
  <div class="panel-body">

    <div class="row">

        <div class="col-md-6" ng-repeat="orientation in form.orientations">
            <div class="form-group">
                <div class="row">
                    <div class="col-md-10">
                        <input type="text" class="form-control" ng-model="orientation.name">
                    </div>
                    <div class="col-md-2">
                        <a href=""  class="remove-field" ng-click="removeOrientation(orientation)"><i class="fa fa-times"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <a href="" class="btn btn-primary btn-sm" ng-click="addOrientation()"><i class="fa fa-plus"></i> Add new orientation</a>
        </div>
    </div>
    


</div>
</div>


<hr />
<div class="panel panel-default">
  <div class="panel-heading">Variants</div>
  <div class="panel-body">

    <div class="row">
        <div class="col-md-12">
            <div class="alert alert-warning" role="alert">Please make sure your images are square dimensions of a minumum 500x500px</div>

        </div> 
    </div> 

</div>
<div class="table-responsive">

<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th class="col-md-1"></th>
            <th >Variant name</th>
            <th ng-repeat="orientation in form.orientations">{{orientation.name}}</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="(key, variant) in form.variants">
            <td class="text-center">
                <a href="" ng-click="moveVariantUp(variant)"><i class="fa fa-arrow-up"></i></a>
                <a href="" ng-click="moveVariantDown(variant)"><i class="fa fa-arrow-down"></i></a>
            </td>
            <td >
                <!--<input type="text" class="form-control" ng-model="variant.name"><br />-->
                <div class="row">
                    <div class="col-md-10">
                        <select ng-change="updateVariant(key, variant, choice)" ng-model="variant.name" ng-options="choice for choice in variantChoices"  style="width: 110px;"></select><br style="clear: both"/>
						<!--<div ng-repeat="hex in variant.hexes" style="background:{{hex}};width: 11px;height: 11px;display: block;border: 1px solid #000;"></div>-->
						<div ng-repeat="hex in variant.colors track by $index" style="float:left; background:{{hex}};width: 11px;height: 11px;display: block;border: 1px solid #000;"></div>

                    </div>
                    <div class="col-md-2">
                        <!--<a ng-if="$last" class="btn btn-default btn-block" href="" ng-click="addVariantType()"><i class="fa fa-plus"></i> New type</a>-->
                        <a href="" class="remove-field" ng-click="removeVariant(variant)"><i class="fa fa-times"></i></a>
                    </div>
                </div>
                <br />
                <!--<input type="text" class="form-control" ng-model="variant.price" placeholder="1000"><br />-->
            </td>
            <td ng-repeat="orientation in form.orientations" class="text-center">

                <div flow-init="{singleFile:true, target: '<?= site_url('products/upload/') ?>', query:{slug:'<?= $product['slug'] ?>', variant:variant.name, orientation:orientation.name}}" flow-files-submitted="$flow.upload()" flow-file-added="!!{png:1,jpg:1}[$file.getExtension()]" flow-file-success="uploader.controllerFn($flow, $file, $message, variant, orientation)">

                    <div class="" ng-show="!$flow.files.length">
                        <img ng-if="variant.orientations[orientation.name]" ng-src="<?= base_url('../data/images/') ?>{{variant.orientations[orientation.name]}}"  style="width: 80px"/>
                    </div>

                    <div class="" ng-show="$flow.files.length" style="width: 120px; height: 120px; display: block; background: #000;">
                        <img flow-img="$flow.files[0]" style="max-width: 120px;max-height: 120px;" />
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" ng-show="!$flow.files.length" flow-btn>Select image</button>
                        <button class="btn btn-primary btn-sm" ng-show="$flow.files.length" flow-btn>Change</button>
                    </div>
                </div>

            </td>
        </tr>
    </tbody>
</table>
</div>
<hr />
<div class="panel-body">

    <div class="row">
        <div class="col-md-12">
            <div class=" pull-right" role="group">
                <a href="" class="btn btn-primary btn-sm" ng-click="addVariant()"><i class="fa fa-plus"></i> Add new variant</a>
                <a href="" class="btn btn-primary btn-sm" ng-click="addVariantType()"><i class="fa fa-plus"></i> Add new variant type</a>
            </div>
        </div>
    </div> 
    <hr />


    <div class="form-group">
        <label>Default variant</label>
        <select class="form-control" ng-model="form.defaultVariant" ng-options="variant.name for variant in form.variants"></select>
    </div> 

</div>
</div>

<hr />

<div class="panel panel-default">
  <div class="panel-heading">Editable area</div>
  <div class="panel-body">


    <!-- Nav tabs -->
    <ul class="nav nav-tabs" role="tablist">
        <li ng-class="{active: key == selectedOrientation}" ng-click="switchOrientationView(key)" ng-repeat="(key, orientation) in form.orientations" ><a href="">{{orientation.name}}</a></li>
    </ul>
    <div class="row">
        <div class="col-md-12">
            <br />

            <div class="row">
                <div class="col-md-5">
                    <p>All measurements must be in millimeters</p>

                    <div class="form-horizontal">

                        <div class="form-group">
                            <label class="col-sm-5 control-label">Printable width</label>
                            <div class="col-sm-7">
                                <div class="input-group">
                                    <input type="number" ng-change="calcCoords()" ng-model="form.orientations[selectedOrientation].printable_width" class="form-control">
                                    <span class="input-group-addon">mm</span>
                                </div>
                            </div>
                        </div>


                        <div class="form-group">
                            <label class="col-sm-5 control-label">Printable height</label>
                            <div class="col-sm-7">
                                <div class="input-group">
                                    <input type="number" ng-change="calcCoords()" ng-model="form.orientations[selectedOrientation].printable_height" class="form-control">
                                    <span class="input-group-addon">mm</span>
                                </div>
                            </div>
                        </div>


                        <div class="form-group">
                            <label class="col-sm-5 control-label">Offset X</label>
                            <div class="col-sm-7">
                             <div class="input-group">
                                <input type="number" ng-change="calcCoords()" ng-model="form.orientations[selectedOrientation].printable_offset_x" class="form-control">
                                <span class="input-group-addon">mm</span>
                            </div>
                        </div>
                    </div>


                    <div class="form-group">
                        <label class="col-sm-5 control-label">Offset Y</label>
                        <div class="col-sm-7">
                            <div class="input-group">
                                <input type="number" ng-change="calcCoords()" ng-model="form.orientations[selectedOrientation].printable_offset_y" class="form-control">
                                <span class="input-group-addon">mm</span>
                            </div>
                        </div>
                    </div>
                    <hr />

                    <div class="well">

                        <h5>Orientation dimensions</h5>
                        <div class="form-group">
                            <label class="col-sm-5 control-label">Width</label>
                            <div class="col-sm-7">
                                <div class="input-group">
                                    <input type="number" ng-change="calcCoords()" ng-model="form.orientations[selectedOrientation].width" class="form-control">
                                    <span class="input-group-addon">mm</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-sm-5 control-label">Height</label>
                            <div class="col-sm-7">
                                <div class="input-group">
                                    <input type="number" ng-change="calcCoords()" ng-model="form.orientations[selectedOrientation].width" class="form-control">
                                    <span class="input-group-addon">mm</span>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>

            </div>
            <div class="col-md-7 text-center">
                <br />
				<?/*{{form.slug}}<br />
				{{form.defaultVariant.slug}}<br />
				{{form.orientations[selectedOrientation].name}}<br />
				{{imageUrl( {product:form.slug, w:460, h:460, variant:form.defaultVariant.slug, orientation:form.orientations[selectedOrientation].name} )}}*/?>
                <div style="width: 460px; height: 460px; position: relative; background-color: rgba(0,0,0,0.3);" class="jcrop-holder lifted-corners">

                 <div style="position: absolute; z-index: 600; width: {{selectedOrientationDimensions.printableWidth}}px; height: {{selectedOrientationDimensions.printableHeight}}px; top: {{selectedOrientationDimensions.printableOffsetY}}px; left: {{selectedOrientationDimensions.printableOffsetX}}px; display: block;">

                  <div style="width: 100%; height: 100%; z-index: 310; position: absolute; overflow: hidden;">
                   <img ng-src="{{imageUrl( {product:form.slug, w:460, h:460, variant:form.defaultVariant.slug, orientation:form.orientations[selectedOrientation].name} )}}" style="border: medium none; visibility: visible; margin: 0px; padding: 0px; position: absolute; top: -{{selectedOrientationDimensions.printableOffsetY}}px; left: -{{selectedOrientationDimensions.printableOffsetX}}px; width: 460px; height: 460px;">
                   <div style="position: absolute; opacity: 0.4;" class="jcrop-hline"></div>
                   <div style="position: absolute; opacity: 0.4;" class="jcrop-hline bottom"></div>
                   <div style="position: absolute; opacity: 0.4;" class="jcrop-vline right"></div>
                   <div style="position: absolute; opacity: 0.4;" class="jcrop-vline"></div>
                   <div class="jcrop-tracker" style="cursor: move; position: absolute; z-index: 360;"></div>
               </div>

           </div>

           <div class="jcrop-tracker" style="width: 464px; height: 464px; position: absolute; top: -2px; left: -2px; z-index: 290; cursor: pointer;"></div>

           <input type="radio" style="position: fixed; left: -120px; width: 12px; display: none;" class="jcrop-keymgr">
           <img ng-src="{{imageUrl( {product:form.slug, w:460, h:460, variant:form.defaultVariant.slug, orientation:form.orientations[selectedOrientation].name} )}}" style="display: block; visibility: visible; width: 460px; height: 460px; border: medium none; margin: 0px; padding: 0px; position: absolute; top: 0px; left: 0px; opacity: 0.6;">

       </div>

            <br />
            <p><small>{{form.orientations[selectedOrientation].name}} view</small></p>

        </div>
    </div>
</div>
</div>    
</div>
</div>

<hr />

<div class="panel panel-default">
  <div class="panel-heading">Sizes</div>
  <div class="panel-body">

    <div class="row">

        <div class="col-md-6" ng-repeat="size in form.sizes">
            <div class="form-group">
                <div class="row">
                    <div class="col-md-10">
                        <input type="text" class="form-control" ng-model="size.name">
                    </div>
                    <div class="col-md-2">
                        <a href=""  class="remove-field" ng-click="removeSize(size)"><i class="fa fa-times"></i></a>
                    </div>
                </div>
            </div>
        </div>


    </div>
    <a href="" class="btn btn-primary btn-sm" ng-click="addSize()"><i class="fa fa-plus"></i> Add new size</a>
</div>
</div>

<div class="row">
    <div class="col-md-12">

        <button type="button" class="btn btn-primary pull-right" ng-click="saveProduct()" ng-hide="saving">Save product</button>
        <button type="button" class="btn btn-primary pull-right" ng-show="saving">Saving...</button>

    </div>
</div>


</form>

<script>
var product = <?= json_encode($product) ?>;
var variants = <?= json_encode($variants) ?>;
</script>
<script>
app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
  return input;
};
});

function ProductController($scope, $http, SweetAlert, $modal) {
  window.scope = $scope;
  $scope.variantChoices = _.pluck(variants, "name");
  $scope.variants = variants;
  $scope.handles = { handles: true};
  $scope.coords = {};
  
  $scope.$watch('form.defaultVariant', function() {
       		$scope.cacheNumber = $scope.cacheNumber + 1;
});

  $scope.form = {};   
        /*$scope.default.orientations = [
            {name:'Front', status:true, x1:0,  x2:500,  y1:0, y2:500 },
            {name:'Back', status:true, x1:0,  x2:500,  y1:0, y2:500 },
            {name:'Right', status:false, x1:0,  x2:500,  y1:0, y2:500 },
            {name:'Left', status:false, x1:0,  x2:500,  y1:0, y2:500 }
            ];*/

            $scope.selectedOrientation = 0;
        //$scope.form.orientations = [];
        $scope.form.variants = [
			{name:'White', price:'1000', orientations:{}}
        ];        
		$scope.form.sizes = [ {name:'S'}, {name:'M'}, {name:'L'} ];

        $scope.form.defaultVariant = $scope.form.variants[ 0 ];

        $scope.switchOrientationView = function(key) {
            $scope.selectedOrientation = key;
            $scope.coords[0] = parseFloat($scope.form.orientations[$scope.selectedOrientation].x1);
            $scope.coords[1] = parseFloat($scope.form.orientations[$scope.selectedOrientation].y1);
            $scope.coords[2] = parseFloat($scope.form.orientations[$scope.selectedOrientation].x2);
            $scope.coords[3] = parseFloat($scope.form.orientations[$scope.selectedOrientation].y2);
            $scope.calcCoords();
        };

	$scope.getProductView = function() {
		var variant = $scope.form.variants.indexOf($scope.form.defaultVariant);
		try {
			return variant.orientations[$scope.selectedOrientation];
		}
		catch(err) {
			return "blank.jpg";
		}
      };

      $scope.updateVariant = function(key, variant, choice) {
        var newChoice = _.find($scope.variants, {name: variant.name});
		//variant = $.extend({}, variant, choice);
		var changeDefault = false;
		if($scope.form.defaultVariant == $scope.form.variants[key]) {
			changeDefault = true;	
		}
		
		var variant = {};
		variant.name = newChoice.name;
        variant.slug = newChoice.slug;
        variant.additional_price = newChoice.additional_price;
        variant.colors = newChoice.hexes;
        variant.hexes = newChoice.hexes;
        variant.price = newChoice.price;
        variant.orientations = {};
		$scope.form.variants[key] = variant;
		
		if(changeDefault) {
			$scope.form.defaultVariant = $scope.form.variants[key];
		}
		$scope.cacheNumber = $scope.cacheNumber + 1;
		
    };      

    $scope.moveVariantUp = function(variant) {
        $scope.form.variants.moveUp(variant);
    };

    $scope.moveVariantDown = function(variant) {
        $scope.form.variants.moveDown(variant);
    };

    $scope.removeSize = function(size) {
        if($scope.form.sizes.length == 1) {
            SweetAlert.swal("Oops...", "You must have at least one size!", "error");
            return false;
        }
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You will not be able to recover this size!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            var index = $scope.form.sizes.indexOf(size);
            if (index > -1) {
                $scope.form.sizes.splice(index, 1);
                console.log($scope.form.sizes);
                $scope.$apply();
            }
            swal("Deleted!", "Your size has been deleted!", "success");
        });


    };
    $scope.removeVariant = function(variant) {
        if($scope.form.variants.length == 1) {
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
            closeOnConfirm: false
        },
        function(){
            var index = $scope.form.variants.indexOf(variant);
            if (index > -1) {
                $scope.form.variants.splice(index, 1);
                console.log($scope.form.variants);
                $scope.$apply();
            }
            swal("Deleted!", "Your variant has been deleted!", "success");
        });


    };
	
	$scope.cacheNumber = 1;
    $scope.imageUrl = function(data) {
        return "<?= base_url("../api/image.php?") ?>" + $.param( data ) + "&nocache=" + $scope.cacheNumber;
    };

    $scope.addOrientation = function() {
        $scope.form.orientations.push({name:'Untitled ' + $scope.form.orientations.length});
    };
    $scope.addSize = function() {
		$scope.form.sizes.push({name:'Untitled ' + $scope.form.sizes.length});
    };

    $scope.uploader = {
		controllerFn: function ($flow, $file, $message, variant, orientation) {
			var message = angular.fromJson($message);
			console.log(variant);
			variant.orientations[orientation.name] = message.filename;
				console.log($flow, $file, $message, variant, orientation); // Note, you have to JSON.parse message yourself.
				$file.msg = $message;// Just display message for a convenience
				$http.post('<?= site_url("products/edit") ?>', $scope.form).
					success(function(data, status, headers, config) {
					  if(data.status) {
						product = data.product;
						$scope.cacheNumber = $scope.cacheNumber + 1;
						$scope.init();
					}

				}).error(function(data, status, headers, config) {

				});
			}
		};

        $scope.addVariant = function() {
			
			var newChoice = _.first(variants);
			
			var variant = {};
			variant.name = newChoice.name;
			variant.slug = newChoice.slug;
			variant.additional_price = newChoice.additional_price;
			variant.colors = newChoice.hexes;
			variant.hexes = newChoice.hexes;
			variant.price = newChoice.price;
			variant.orientations = {};
			
            $scope.form.variants.push(variant);
        };

        $scope.addVariantType = function() {


            var modalInstance = $modal.open({
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              resolve: {
                myVariants: function () {
                  return $scope.variants;
              }
          }
      });

            modalInstance.result.then(function (data) {
                $scope.form.variants.push(data.myVariant);
                $scope.variantChoices = _.pluck(data.variants, "name");
                $scope.variants = data.variants;
            }, function () {
              console.info('Modal dismissed at: ' + new Date());
          });

        };

        $scope.saving = false;
        $scope.saveProduct = function() {
            $scope.saving = true;
            $http.post('<?= site_url("products/edit") ?>', $scope.form).
            success(function(data, status, headers, config) {
              // this callback will be called asynchronously
              // when the response is available
              if(data.status) {
                $scope.saving = false;
                SweetAlert.swal("Saved...", "Successfully saved!", "success");
				console.log(data);
				product = data.product;
				$scope.cacheNumber = $scope.cacheNumber + 1;
				$scope.init();
                //window.location.href = '<?= site_url("products") ?>';
            }

        }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              $scope.saving = false;
          });
        };

        $scope.removeOrientation = function(orientation) {
            if($scope.form.orientations.length == 1) {
                SweetAlert.swal("Oops...", "You must have at least one orientation!", "error");
                return false;
            }
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You will not be able to recover this orientation!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false
            },
            function(){
                var index = $scope.form.orientations.indexOf(orientation);
                if (index > -1) {
                    $scope.form.orientations.splice(index, 1);
                    console.log($scope.form.orientations);
                    $scope.$apply();
                }
                swal("Deleted!", "Your orientation has been deleted!", "success");
            });
        };
        
        $scope.designerWidth = 460;
        $scope.selectedOrientationDimensions = {};
        $scope.calcCoords = function() {

            $scope.form.orientations[$scope.selectedOrientation].height = $scope.form.orientations[$scope.selectedOrientation].width;
            
            var dims = $scope.form.orientations[$scope.selectedOrientation];
            var ratio = $scope.designerWidth/dims.width;

            $scope.selectedOrientationDimensions.width = ratio * dims.width;
            $scope.selectedOrientationDimensions.height = ratio * dims.height;
            $scope.selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
            $scope.selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
            $scope.selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
            $scope.selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;

        };

        $scope.init = function() {

            $scope.form = $.extend({}, $scope.form, product);
            console.log( '$scope.init', $scope.form.orientations);
            if(typeof product.defaultVariant != 'undefined'){
                //console.log('undefined', product.defaultVariant, 5);
                $scope.form.defaultVariant = _.findWhere($scope.form.variants, {"name":product.defaultVariant});
                if(angular.isUndefined($scope.form.defaultVariant)) {
                    $scope.form.defaultVariant = $scope.form.variants[ 0 ];
                }
            }            
			if(typeof $scope.form.orientations == 'undefined'){
                $scope.form.orientations = [{name:'Front', status:true, x1:0,  x2:500,  y1:0, y2:500 }];
            }
            $scope.switchOrientationView(0);

        };
        $scope.init();

    };


    function ModalInstanceCtrl($scope, $modalInstance, myVariants, $http, $q) {

        $scope.variants = myVariants;

        $scope.variant = {};
        $scope.variant.name = 'Untitled';
        $scope.variant.hexes = [];
        $scope.variant.hexes[0] = '#000000';
        $scope.variant.hexes[1] = '';
        $scope.variant.hexes[2] = '';    
        $scope.variant.myHexes = [];
        $scope.variant.myHexes[0] = '#000000';
        $scope.variant.myHexes[1] = '';
        $scope.variant.myHexes[2] = '';

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

      $scope.slugify = function(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
        };

        $scope.ok = function () {

        //check if variant name exists
        var exists = _.find($scope.variants, {name: $scope.variant.name});
        if(exists) {
            alert("ERROR - name exists");
            return false;
        }

        var valid_colors = false;
        _.each($scope.variant.hexes, function(hex, i) {
            if(hex != '') {
                valid_colors = tinycolor(hex).isValid();
            }
        });
        if(!valid_colors) {
            alert("ERROR - invalid hex code");
            return false;
        }

        var myVariant =  _.clone($scope.variant);
        myVariant.name = $scope.variant.name;
        myVariant.slug = $scope.slugify($scope.variant.name);
        myVariant.hexes = [];
        myVariant.colors = [];
        _.each($scope.variant.hexes, function(hex, i) {
            console.log(i, hex);
            if(hex != '') {
                myVariant.hexes.push(tinycolor(hex).toHexString());
                myVariant.colors.push(tinycolor(hex).toHexString());
            }
        });

        $scope.variants.push(myVariant);


        $scope.saveVariants(myVariant).then(function(myVariant) {
            $modalInstance.close(myVariant);
        }, function(reason) {
          alert('Failed: ' + reason);
      }, function(update) {
          alert('Got notification: ' + update);
      });

        return false;
        
    };

    //save using ajax
    $scope.saveVariants = function(myVariant) {

        var deferred = $q.defer();

        $http.post('<?= site_url("variants/save") ?>', $scope.variants).
        success(function(data, status, headers, config) {

          // this callback will be called asynchronously
          // when the response is available
          if(data.status) {
            deferred.resolve({ status: true, myVariant:myVariant, variants:$scope.variants });
        }

    }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          deferred.reject({ status: false });
      });

        return deferred.promise;
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

};

</script>
<script type="text/ng-template" id="myModalContent.html">
<div class="modal-header">
<h3 class="modal-title">Add a new variant type</h3>
</div>
<div class="modal-body">

<form class="form-horizontal" role="form">
<div class="form-group">
<label class="col-sm-2 control-label">Name</label>
<div class="col-sm-8">
<input type="text" class="form-control" ng-model="variant.name" >
</div>
</div>


<div class="form-group" ng-repeat="n in [] | range:3">
<label class="col-sm-2 control-label">Hex {{n+1}}</label>
<div class="col-sm-8">
<div class="input-group">
<input type="text" class="form-control" ng-model="variant.hexes[n]" placeholder="e.g. #000000" ng-required='n == 0'>
<span class="input-group-addon input-group-addon-color" style="padding: 5px 10px">
<div style="background:{{getHex(variant, n)}};"></div>
</span>
</div>                    
</div>
</div>

</form>

</div>
<div class="modal-footer">
<button class="btn btn-primary" ng-click="ok()">OK</button>
<button class="btn btn-warning" ng-click="cancel()">Cancel</button>
</div>
</script>
@endblock
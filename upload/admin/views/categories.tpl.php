@extend('layout.tpl.php')

@block('content')
<ul class="nav nav-tabs">
      <li role="presentation"><a href="<?= site_url('products') ?>">Products</a></li>
      <li role="presentation" class="active"><a href="<?= site_url('categories') ?>">Categories</a></li>
      <li role="presentation"><a href="<?= site_url('variants') ?>">Variants</a></li>
    </ul>
<br />
<div class="row">
<div class="col-md-12">
  <h3>Categories</h3>
  <p>A category is an organizational unit to which you assign your products. When viewing the designer, customers will click on a category to view products that have been assigned to that category.</p>
</div>

</div>
  <hr />
	<div ng-if="success" class="alert alert-success" role="alert">{{success}}</div>		
	<form ng-controller="CategoriesController" ng-submit="saveCategories()">
		<div  style="max-height: 500px; overflow-x: hidden; overflow-y: scroll;" id="table_categories">
		<table class="table table-striped" >
      <thead>
        <tr>
          <th>#</th>
          <th></th>
          <th>Category</th>
          <th>Slug</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="category in categories">
          <td>{{$index+1}}</td>
          <td>
          	<a href="#" ng-click="moveUp(category)"><i class="fa fa-arrow-up"></i></a>
          	<a href="#" ng-click="moveDown(category)"><i class="fa fa-arrow-down"></i></a>
          </td>
          <td><input type="text" class="form-control form-control-small" ng-model="category.name"></td>
          <td>{{slugify(category.name)}}</td>
          <td>
          	<a href="#" class="remove-field" ng-click="removeCategory(category)"><i class="fa fa-times"></i></a>
          </td>
        </tr>
      </tbody>
    </table>
	  </div>
	  <br />

  		<div class="row">
			<div class="col-md-8">
<button type="button" class="btn btn-default add-field-button" ng-click="addCategory()">Add new category</button>
			</div>
			<div class="col-md-4">
				<button type="submit" class="btn btn-primary  pull-right" ng-hide="saving">Save categories</button>
                <button type="button" class="btn btn-primary pull-right" ng-show="saving">Saving...</button>
			</div>
		</div>

				
	</form>

<script>
	var categories = <?= json_encode($categories) ?>;

    function CategoriesController($scope, $http, $q, SweetAlert) {
      window.scope = $scope;

        $scope.removeCategory = function(category) {
            if($scope.categories.length == 1) {
                SweetAlert.swal("Oops...", "You must have at least one category!", "error");
                return false;
            }

            SweetAlert.swal({
                title: "Are you sure?",
                text: "You will not be able to recover this category!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            },
            function(){
                var index = $scope.categories.indexOf(category);
                if (index > -1) {
                    $scope.categories.splice(index, 1);
                    $scope.$apply();

                    $scope.updateCategories()
					.then(function(result){
					}, function(error){
					});
                }
            });


        };
        
        $scope.moveUp = function(category) {
            $scope.categories.moveUp(category);
        };

        $scope.moveDown = function(category) {
            $scope.categories.moveDown(category);
        };

        $scope.addCategory = function() {
            $scope.categories.push({name:'Untitled ' + $scope.categories.length});
            setTimeout(function() {
            	$("#table_categories").scrollTop($("#table_categories")[0].scrollHeight);
			}, 100);
        };

		$scope.slugify = function(text) {
			return getSlug(text);
			return text.toString().toLowerCase()
				.replace(/\s+/g, '-')           // Replace spaces with -
				.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
				.replace(/\-\-+/g, '-')         // Replace multiple - with single -
				.replace(/^-+/, '')             // Trim - from start of text
				.replace(/-+$/, '');            // Trim - from end of text
		};

    	$scope.saving = false;
        $scope.saveCategories = function() {
			$scope.saving = true;
			$scope.updateCategories()
			.then(function(result){
				$scope.saving = false;
				SweetAlert.swal("Saved...", "Successfully saved!", "success");
			}, function(error){
				// error
				$scope.saving = false;
			});
        };

        $scope.updateCategories = function() {
			var deferred = $q.defer();
          	$http.post('<?= site_url("categories/save") ?>', $scope.categories).
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
			$scope.categories = categories;
        };

        $scope.init();

    }

</script>

@endblock
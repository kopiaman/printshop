/**
 * 
 * Controller for browsing and selecting products
 * 
 */
angular.module('app').controller('ProductBrowserController', function( $scope, $location, $urlRouter, $stateParams, $modalInstance, ProductService, ApiService, CartService, PriceService) {

    this.name = "ProductBrowserController";
    this.params = $stateParams;

    window.scope = $scope;
    $scope.text = "ProductBrowserController";
    $scope.categories = null;
    $scope.selectedCategory = null;
    $scope.products = null;
    $scope.money = PriceService;
    $scope.selectedProduct = null;
    $scope.catalog = null;


    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };    

    $scope.dismiss = function() {
        $scope.$dismiss();
    };

    $scope.save = function() {
        item.update().then(function() {
            $scope.$close(true);
        });
    };

    $scope.setSelectedVariant = function(variant) {
        $scope.selectedVariant = variant;
    };

    $scope.confirmProduct = function() {
        //save selection
        var url = 'product/selection/' + $scope.selectedProduct.slug + "/" + $scope.selectedVariant.slug;
        $location.path(url);
        $scope.$dismiss();
    };

    $scope.selectProduct = function(product) {
        $scope.selectedProduct = product;
        console.log(product.variants, product.defaultVariant, _.find(product.variants, {name : product.defaultVariant}));
        $scope.setSelectedVariant(_.find(product.variants, {name : product.defaultVariant}));


    };    

    $scope.selectCategory = function(category) {
        $scope.selectedCategory = category;
        $scope.products = _.where($scope.catalog, {category : category.name});
        $scope.selectProduct($scope.products[0]);
    };
    
    $scope.getProducts = function() {
        ProductService.getProducts().then(function(data) {

            $scope.categories = data.categories;
            $scope.catalog = data.products;

            var currentItem = CartService.getSelectedItem();
            
            var category = _.first($scope.categories);
            var product = _.find(data.products, {category: category.name});
            console.log(category.name, product);
            $scope.selectCategory(category);
            $scope.selectProduct(product);

        });
    }
  
    $scope.init = function() {
        $scope.getProducts();
	};
    
    $scope.init();
    
});
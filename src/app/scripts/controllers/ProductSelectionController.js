/**
 * 
 * Controller for selecting a product
 * 
 */
angular.module('app').controller('ProductSelectionController', function( $scope, $location, $urlRouter, $stateParams, $http, ApiService, ProductService, $state, CartService) {

    this.name = "ProductSelectionController";
    $scope.setActiveTab('product');

    $scope.selectProduct = function() {

        //select my product    
        ProductService.getProducts().then(function(data) {

            var product = _.find(data.products, {slug : $stateParams['productSlug']});
            var variant = _.find(product.variants, {slug : $stateParams['variantSlug']});
			
            CartService.updateItem(product, variant, CartService.selectedItemId);
            ProductService.setOrientation(_.findKey($scope.currentItem.variant.orientations));
            $scope.setOrientation(_.findKey($scope.currentItem.variant.orientations));
            console.log("CHANGE FRAME");
            //resize canvas
            $scope.updateOrientation();

            //change border colors
            $scope.borderColor = getBorderColor(_.first($scope.currentItem.variant.colors));
            $('#designer-container').data('border',  $scope.borderColor);

            //preload images loaded
            _.each($scope.currentItem.variant.orientations, function(img, orientation) { 
                var image_url = $scope.imageUrl( {product:$scope.currentItem.product.slug, w:$scope.designerWidth, h:$scope.designerHeight, variant:$scope.currentItem.variant.slug, orientation:orientation} );
                var image = new Image();
                image.src = image_url;
            });
            

            $state.go('app.product.home');
        });

	};
	
	$scope.$watch('isReady', function(newValue, oldValue) {
		if($scope.isReady) {
			$scope.selectProduct();
		}
    });
	
    $scope.init = function() {
		if($scope.isReady) {
			$scope.selectProduct();
		}
    };
    
    $scope.init();
    
});
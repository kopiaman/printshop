/**
 * 
 * Controller for viewing a product and switching a product variant
 * 
 */
angular.module('app').controller('ProductController', function( $scope, $location, $urlRouter, $stateParams, ApiService, ProductService, CartService) {
	this.name = "ProductController";
	this.params = $stateParams;
    window.scope = $scope;
	$scope.setActiveTab('product');

    $scope.setSelectedVariant = function(variant) {
        CartService.updateItem($scope.currentItem.product, variant, CartService.selectedItemId);
        $scope.selectedVariant = variant;

        //set the control colors
        $scope.borderColor = getBorderColor(_.first($scope.currentItem.variant.colors));
        $('#designer-container').data('border',  $scope.borderColor);
    };

    $scope.init = function() {
    };
    $scope.init();	


});
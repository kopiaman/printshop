/**
 * Manages the cart
 */
angular.module('app').controller('CartController', function( $scope, $rootScope, $location, $http, PriceService, $state, ProductService, CartService, ApiService, $modal) {
	this.name = "CartController";

    window.cart_scope = $scope;
    window.cart_root = $rootScope;
    //$scope.items = [];
    $scope.images = {}
    $scope.CartService = CartService;
    $scope.money = PriceService;
    $scope.thumbWidth = 75;
    $scope.zoom = $scope.thumbWidth/460;
    $scope.justAdded = false;

    /*$scope.$watch('items', function (newVal) {
        $scope.reCalculatePrice();
    }, true);*/

    //Product has changed
    $scope.$watch('currentItem', function(newValue, oldValue) {
        $scope.init();
    });

    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };
    
    $scope.imageDims = function(dims) {
        
        var ratio = $scope.thumbWidth/dims.width;

        var selectedOrientationDimensions = {};
        selectedOrientationDimensions.width = ratio * dims.width;
        selectedOrientationDimensions.height = ratio * dims.height;
        selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
        selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
        selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
        selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;

        return selectedOrientationDimensions;

    }; 

    $scope.sumQuantities = function(quantities) {
        return CartService.sumQuantities(quantities);
    };
    
    $scope.sumPrice = function(quantities, price) {
        return CartService.sumPrice(quantities, price);
    };    

    $scope.reCalculatePrice = function() {
       $scope.setTotalPrice(CartService.sumTotalPrice());
       //$scope.totalPrice = CartService.sumTotalPrice();
    };
    
    $scope.addNewItem = function() {
        //alert(CartService.getItems().length);
        ProductService.getProducts().then(function(data) {
            
            
            var category = _.first(data.categories);
            var product = _.find(data.products, {slug: $scope.default_product});
            if(angular.isUndefined(product)) {
                product = _.find(data.products, {category: category.name});
            }

            var variant = _.find(product.variants, {slug: product.defaultVariant});
            if(angular.isUndefined(variant)) {
                variant = _.first(product.variants);
            }
            /*
            var category = _.first(data.categories);
            var product = _.find(data.products, {category: category.name});
            var variant = _.first(product.variants);
            */
            var newItem = CartService.newItem(product, variant);
            CartService.setSelectedItem(newItem.id);
            $scope.items = CartService.getItems();
            $scope.dismiss();
            $state.go('app.product.home');
            
        });

    };	

    $scope.duplicateItem = function(item) {

        var newItem = CartService.duplicateItem(item);
        CartService.setSelectedItem(newItem.id);
        $state.go('app.product.home');

    };

    $scope.removeItem = function(itemId) {

        CartService.remove(itemId);

        if(CartService.getItems().length == 0) {
            $scope.addNewItem();
        }
        $scope.items = CartService.getItems();
        $scope.reCalculatePrice();

    };    

    $scope.switchCurrentItem = function(itemId) {
        CartService.setSelectedItem(itemId);
    };

    
    $scope.dismiss = function() {

		if($('.cartModal').hasClass('in')) {
            $scope.$dismiss();
        }
        $('#cart').removeClass('active');
        
    };

    $scope.goToCheckout = function() {
        
        $scope.dismiss();
        console.log('$scope.settings', $scope.settings);
        var modalInstance = $modal.open({
          templateUrl: 'buy.checkout.html',
          controller: 'BuyCheckoutController',
          size: 'lg',
          resolve: {
            stripe_publishable_key: function () {
                return $scope.stripe_publishable_key;
            },
            currency_code: function () {
                return PriceService.getCurrency();
            },
            settings: function () {
                return $scope.settings;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.resetCart(); //clear the cart
        }, function () {
            console.log("CLOSED");
        });

    };

    $scope.init = function() {
        $scope.items = CartService.getItems();
        $scope.reCalculatePrice();
		$('[data-toggle="tooltip"]').tooltip({'placement': 'top'}); //the cart tooltip
	};

    $scope.init();
    
});
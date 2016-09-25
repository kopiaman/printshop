/**
 * Just before checkout
 */
angular.module('app').controller('BuyController', function( $scope, $location, $urlRouter, $stateParams, localStorageService, $http, ApiService, PriceService, $modal, CanvasService, CartService ) {
	this.name = "BuyController";
	this.params = $stateParams;
	$scope.quantities = {};
	$scope.pricing = {};
	$scope.sizeRows = 0;
	$scope.deliveryTypes = {};
	$scope.postageOption = 0;
    $scope.CanvasService = CanvasService;
	$scope.CartService = CartService;
    $scope.setActiveTab('buy');
	window.scope = $scope;
    
    $scope.reCalculatePrice = function() {
       $scope.totalPrice = CartService.sumTotalPrice();
    };
    
    $scope.addToCart = function() {

        var item = {};
        item.id = CartService.cartId;
        item.quantities = $scope.quantities;
        item.price = $scope.calculateSinglePrice();
        item.name = $scope.currentItem.product.name;
        item.thumb = 1;
        item.meta = {};
        CartService.insert(item);
        $scope.openCart();
	};
    
    //Quantities have changed
    //canvas has changed
    $scope.$watchCollection('quantities', function(newValue, oldValue) {
        $scope.storeQuantities();
    });
    
    $scope.screenPrint = function() {
        
        if(!$scope.isReady) {
            return "";
        }
        var str = "";
        _.each($scope.layers.orientations_layers, function(layer) {
            if(_.size( layer.fills) > 0) {
                str += _.size( layer.fills) + " color " + layer.name.toLowerCase();
                str += ", ";
            }
        });
        str = str.substring(0, str.length - 2);
        if($scope.isReady) {
            PriceService.setDescription(str);
            PriceService.setTitle($scope.currentItem.product.name);
        }
        return str;
    };
    
    $scope.sumQuantities = function(quantities) {
        var quantity =  _.reduce(quantities, function(memo, num){
                            num = parseInt(num);
                            return memo + num;
                        }, 0);
        return quantity;
    };
    
    $scope.sumPrice = function(quantities, price) {
        var quantity = $scope.sumQuantities(quantities);
        price = accounting.unformat(price);
        var price = price * quantity;
        return accounting.formatMoney(price, PriceService.getCurrencySymbol());
    };    

    $scope.formatMoney = function(price) {    
        return accounting.formatMoney(price, $scope.currency);
    }
    $scope.storeQuantities = function() {  
        PriceService.setQuantities($scope.quantities);
	};
    
    $scope.preInit = function() {
       $scope.quantities = PriceService.getQuantities();

    };
    
    $scope.init = function() {
        $scope.postageOption = PriceService.getPostage();
        $scope.quantities = PriceService.getQuantities();
        
        //load pricing
        $http({method: 'GET', url: ApiService.Url("get_pricing.php"), cache: false}).
            success(function(data, status, headers, config) {
                $scope.pricing = data.pricing;
                $scope.deliveryTypes = data.delivery_types;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        
        var quantities = PriceService.getQuantities();        
        $scope.sizeRows = Math.ceil ( 12 / _.size($scope.currentItem.product.sizes) );
        if($scope.isMobile) {
            $scope.sizeRows = Math.ceil ( 24 / _.size($scope.currentItem.product.sizes) );
        }
        
        _.each($scope.currentItem.product.sizes, function(size) {
            if(quantities && !angular.isUndefined(quantities[size])) {
                $scope.quantities[size] = quantities[size];
            } else {
                $scope.quantities[size] = 0;
            }
        });
        
	};
    
    $scope.openCheckout = function () {
        $scope.openCart();
    };
        
    $scope.$watch('isReady', function(newValue, oldValue) {
        if($scope.isReady) {
            $scope.init();        
        }
    });
    $scope.preInit();      
	
    
});
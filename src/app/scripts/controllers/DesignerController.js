angular.module('app').controller('DesignerController', function($rootScope, $stateParams, $location, $scope, $state, $http, ApiService, ProductService, CanvasService, CartService, $modal, localStorageService, PriceService, FontService, gettextCatalog) {
    this.$state = $state;
    this.$location = $location;

    //canvas properties
    $scope.canvas = null;
    $scope.designerWidth = 460;
    $scope.designerHeight = 460;
    $scope.borderColor = "#000000";   
    $scope.zoom = 1;
    $scope.loaded = 0;  
    $scope.activeTab = 'home';
    $scope.editMode = 'none';
    $scope.defaultFont = 'Alpha Echo';

    //settings
    $scope.site_name = 'PrintPixel';
    $scope.currency_code = 'USD';
    $scope.currency = '$';
    //$scope.stripe_publishable_key = '';
    $scope.settings = {};

    $scope.editableItem = null;
    $scope.editableObject = null;
    $scope.editable = {};
    $scope.currentItem = null;
    $scope.selectedOrientation = ProductService.getOrientation();
    $scope.selectedOrientationDimensions = {};
    $scope.selectedProductOrientations = {};

    $scope.layers = {};   
    $scope.isReady = false; //only ready when products loaded, categories loaded, dom-ready, localstoreage ready
    $scope.totalPrice = 0;
    
    //for debugging
    window.scope = $scope;
    $scope.items = [];
    $scope.money = PriceService;
    $scope.CartService = CartService;
    $scope.CanvasService = CanvasService;
    $scope.ProductService = ProductService;
    $scope.localStorageService = localStorageService;
    $scope.mobileDesignerHidden = false;
    $scope.isMobile = (window.innerWidth <= 480 ? true : false);
    $scope.screenWidth = window.innerWidth;
    $scope.designerLeft = 0;

    $(window).resize(function(){
        $scope.$apply(function(){
            $scope.setViewData();
        });
    });
    $scope.$watch('isReady', function(newValue, oldValue) {
        $scope.setViewData();
    });

    $scope.$watch('items', function (newVal) {
        $scope.totalPrice = CartService.sumTotalPrice();
    }, true);

    $scope.$on('$stateChangeStart', function(e, next, current) { 

        $scope.editMode = 'none';
        var mobileRoutes = ["app.images.home", "app.text.add", "app.images.clip-art", "app.images.upload", "app.images.my-images", "app.images.edit", "app.buy.home"];

        if(_.indexOf(mobileRoutes, next.name) > -1) {
            $scope.hideMobileDesigner();
        } else {
            $scope.showMobileDesigner();
        }

    });
    $scope.$on('$stateChangeSuccess', function(e, next, current) {         
        if(next.url == '') {
            $state.go('app.home');
        }
    });

    $scope.uuid = null;
    $scope.setActiveTab = function(tab) {
        $scope.activeTab = tab;
    };   
    
    $scope.showMobileFooter = true;
    $scope.toggleMobileFooter = function() {
        if($scope.showMobileFooter) {
            $scope.showMobileFooter = false;
        } else {
            $scope.showMobileFooter = true;
        }
    };

    $scope.setViewData = function() {
        $scope.screenWidth = window.innerWidth;
        if(window.innerWidth <= 480) {
            $scope.isMobile = true;
            $scope.designerLeft = -($scope.designerWidth - $scope.screenWidth)/2;
        } else {
            $scope.isMobile = false;
            $scope.designerLeft = 0;
        }
    };    
    $scope.hideMobileDesigner = function() {
        $scope.mobileDesignerHidden = true;
    };
    $scope.showMobileDesigner = function() {
        $scope.mobileDesignerHidden = false;
    };

    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };
    
    $scope.imageTransparentUrl = function(data) {
        return ApiService.imageTransparentUrl(data);
    };
    
    $scope.calcLeft = function(width, offsetWidth) {
        return (-width/2) + (offsetWidth/2);
    };

    //the zoom functions
    $scope.zoomOut = function() {
        $scope.zoom = $scope.zoom - 0.1
        if($scope.zoom <= 1) {
            $scope.zoom = 1; 
        }
        $scope.canvas.setZoom($scope.zoom);
        $scope.drawCanvas();
        $scope.zoomCanvas();
    };
    
    $scope.zoomIn = function() {
        $scope.zoom = $scope.zoom + 0.1
        if($scope.zoom >= 2) {
            $scope.zoom = 2; 
        }
        $scope.zoomCanvas();
    };
    
    $scope.zoomCanvas = function() {
      
        var width = $scope.zoom * $scope.selectedOrientationDimensions.printableWidth;
        var height = $scope.zoom * $scope.selectedOrientationDimensions.printableHeight;
        var scale = width / $scope.canvas.getWidth();
        height = scale * $scope.canvas.getHeight();

        $scope.canvas.setDimensions({
            "width": width,
            "height": height
        });

        $scope.canvas.calcOffset();
        $scope.canvas.setZoom($scope.zoom);
        $scope.drawCanvas();
        if($scope.zoom == 1) {
            $('#designer-product').draggable( "disable" );
        } else {
            $('#designer-product').draggable( "enable" );
        }

    }
    
    //Product has changed
    $scope.$watch(function(){
        return CartService.selectedItemId;
    }, function (newValue) {
        if($scope.isReady) {
            
            $scope.canvas.clear();
            //this means we gotta update the canvas size
            $scope.currentItem = CartService.getSelectedItem();
            $scope.items = CartService.getItems();
            $scope.setOrientation(_.findKey($scope.currentItem.variant.orientations));

        }
    }, true);

    //Orientation has changed
    $scope.$watch(function(){
        return ProductService.currentOrientation;
    }, function (newValue) {
        if($scope.isReady) {

            $scope.canvas.clear();

            $scope.selectedOrientation = ProductService.getOrientation();
            $scope.updateOrientation();
        }

    }, true);

    //this handles the editable area switching
    $scope.updateOrientation = function() {

        //return false;
        $scope.zoom = 1; 
        var dims = _.find($scope.currentItem.product.orientations, {name:$scope.selectedOrientation});

        if(dims) {
            //$scope.designerWidth = dims.width;
            //$scope.designerHeight = dims.height;
            var ratio = $scope.designerWidth/dims.width;

			$scope.selectedOrientationDimensions.width = ratio * dims.width;
            $scope.selectedOrientationDimensions.height = ratio * dims.height;
            $scope.selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
            $scope.selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
            $scope.selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
            $scope.selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;

            var prevWidth = $scope.canvas.getWidth();
            var prevHeight = $scope.canvas.getHeight();

            $scope.canvas.setWidth($scope.selectedOrientationDimensions.printableWidth);
            $scope.canvas.setHeight($scope.selectedOrientationDimensions.printableHeight);

            $scope.drawCanvas();
        }

        //fetch the canvas
        var orientationCanvas = null;
        if(angular.isUndefined($scope.currentItem.canvases[$scope.selectedOrientation])) {
            orientationCanvas = $scope.canvas;
        } else {
            
            // parse the data into the canvas
            orientationCanvas = $scope.currentItem.canvases[$scope.selectedOrientation];
            $scope.canvas.loadFromJSON(orientationCanvas);

            //reset zoom
            $scope.zoom = 1;
            $scope.zoomCanvas();

            // re-render the canvas
            $scope.drawCanvas();
        }
        //$scope.layers = $scope.calculateLayers();

        //set the control colors
        $scope.borderColor = getBorderColor(_.first($scope.currentItem.variant.colors));
		$('#designer-container').data('border',  $scope.borderColor);

		$('#designer-container').on({
			mouseenter: function () {
				$('#designer-container').css('border-color', $('#designer-container').data('border'));
			},
			mouseleave: function () {
				$('#designer-container').css('border-color', 'transparent');
			}
		});

    };

    $scope.setTotalPrice = function(totalPrice) {
        $scope.totalPrice = totalPrice;
    };
    
    $scope.saveCanvas = function() {
        CartService.updateItemCanvas($scope.selectedOrientation, $scope.canvas, CartService.selectedItemId);
    };

    $scope.setStackPosition = function(command) {
        var object = canvas.getActiveObject();
        if(object == null) {
            return;
        }
        
        if(command == 'bringToFront') {
            object.bringToFront();
            //$scope.canvas.item($scope.editableItem).bringToFront();
        }        

        if(command == 'sendBackwards') {
            object.sendBackwards();
            //$scope.canvas.item($scope.editableItem).sendBackwards();
        }        

        if(command == 'bringForward') {
            object.bringForward();
            //$scope.canvas.item($scope.editableItem).bringForward();
        }        

        if(command == 'sendToBack') {
            object.sendToBack();
            //$scope.canvas.item($scope.editableItem).sendToBack();
        }
        //canvas.renderAll();
        //$scope.drawCanvas();
        $scope.canvas = canvas;
        $scope.saveCanvas();
    }
    
    $scope.storeOrientation = function(orientation) {
        CanvasService.setOrientationDesign($scope.selectedOrientation, $scope.canvas);
        CartService.updateItemCanvas($scope.selectedOrientation, $scope.canvas, CartService.selectedItemId);
    }
    
    //this handles the canvas switching
    $scope.setOrientation = function(orientation) {
        
        ProductService.setOrientation(orientation);
        $scope.selectedOrientation = orientation;

        //fetch the canvas
        var orientationCanvas = null;
        if(angular.isUndefined($scope.currentItem.canvases[$scope.selectedOrientation])) {
            orientationCanvas = $scope.canvas;
        } else {
            
            // parse the data into the canvas
            orientationCanvas = $scope.currentItem.canvases[$scope.selectedOrientation];
            // parse the data into the canvas
            orientationCanvas = $scope.currentItem.canvases[$scope.selectedOrientation];
            $scope.canvas.loadFromJSON(orientationCanvas);

            //reset zoom
            $scope.zoom = 1;
            $scope.zoomCanvas();

            // re-render the canvas
            $scope.drawCanvas();
        }

    };
    
    $scope.fetchSession = function() {
        $http({method: 'GET', url: ApiService.Url("session.php"), cache: false}).
        success(function(data, status, headers, config) {
            $scope.uuid = data.uuid;
            if($scope.loaded < 100) {
               $scope.loaded = 60; 
            }
        }).
        error(function(data, status, headers, config) {

        });
    }

    $scope.changeState = function(value) {
        $state.go(value);
    }

    $scope.updateLocalStorage = function() {
        if($scope.canvas.getObjects().length > 0) { //only set orientation if we have at least 1 element
            $scope.storeOrientation($scope.selectedOrientation);
        } 
    }
    $scope.drawCanvas = function() {
        $scope.updateLocalStorage();
        canvas = $scope.canvas;
        canvas.renderAll();
        //canvas.calculateOffset();
    };

    $scope.resetCart = function() {
        CartService.reset(); //remove all cart items
        $scope.initCart();
    };

    $scope.initCart = function(value) {
        //fetch the last edited item in the cart
        $scope.currentItem = CartService.getSelectedItem();
        $scope.items = CartService.getItems();

        //do any of the cart products need to be removed?
        _.each($scope.items, function(item) {

            //does the product exist
            var product = _.find(productData.products, {slug: item.product.slug});
            if(angular.isUndefined(product)) {
                CartService.remove(item.id);
            }

            //does the variant exist?
           if(!angular.isUndefined(product)) {
                var variant = _.find(product.variants, {slug: item.variant.slug});
                if(angular.isUndefined(variant)) {
                    CartService.remove(item.id);
                }
            }

        });
        
        $scope.items = CartService.getItems();
        
        if($scope.items.length == 0) {

            var category = _.first(productData.categories);
            var product = _.find(productData.products, {slug: $scope.default_product});
            if(angular.isUndefined(product)) {
                product = _.find(productData.products, {category: category.name});
            }

            var variant = _.find(product.variants, {slug: product.defaultVariant});
            if(angular.isUndefined(variant)) {
                variant = _.first(product.variants);
            }
            
            CartService.newItem(product, variant);
            $scope.currentItem = CartService.getSelectedItem();
        }
        
        ProductService.setOrientation(_.findKey($scope.currentItem.variant.orientations));
    };

    $scope.init = function(value) {

        $scope.loaded = 30;

        //get products
        ProductService.getProducts().then(function(productData) {
            window.productData = productData;
            //set default items
            $scope.site_name = productData.settings.site_name;
            $scope.currency_code = productData.settings.currency;
            //$scope.stripe_publishable_key = productData.settings.stripe_publishable_key;
            $scope.currency = productData.settings.currency_symbol;
            $scope.default_product = productData.settings.default_product;
            $scope.settings = productData.settings;
            $scope.settings.paymentMethods = productData.payment_methods;

            gettextCatalog.setCurrentLanguage($scope.settings.language);

            PriceService.setCurrency(productData.settings.currency);
            PriceService.setCurrencySymbol(productData.settings.currency_symbol);

            $scope.loaded = 50;

            //gotta get the pricing
            FontService.getFonts().then(function(data) {
                $scope.loaded = 75;

                PriceService.getPricing().then(function(data) {
					
                    $scope.loaded = 100;
                    $scope.isReady = true;
                        
                    $scope.initCart();                    

                    //load actual fonts
                    FontService.preloadFonts().then(function() {
                    
                    });

                });
            });

        });
        

        
        $scope.canvas = canvas;
        $scope.fetchSession();

    };

    $scope.init();


    
    $scope.openCart = function() {
        var modalInstance = $modal.open({
          templateUrl: 'cart.html',
          controller: 'CartController',
          windowClass: 'cartModal',
          size: 'lg',
          scope: $scope,
          resolve: {
            currentItem: function () {
              return $scope.currentItem;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          //$scope.selected = selectedItem;
        }, function () {
        });

    };

});
'use strict';

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
	
	$urlRouterProvider.otherwise('/home');

	$stateProvider
		.state('app',{
	      url: '',
	      views: {
	        '': {
	            templateUrl: 'viewer.html',
	            abstract: true
	        },      
	        'edit_text': {
				templateUrl: 'text.edit.html',
	            controller: 'TextEditController'
	        },
	        'edit_image':{
				templateUrl: 'images.edit.html',
				controller: 'ImagesEditController'
	        }
	      }
	    })
		// HOME STATES AND NESTED VIEWS ========================================
		.state('app.home', {
			url: '/home',
			templateUrl: 'home.html'
		})			
		// IMAGES STATES AND NESTED VIEWS ========================================
		.state('app.product', {
			url: '/product',
            abstract: true,
            templateUrl: 'viewer.html',
			controller: 'ProductController'
		})
        .state('app.product.home', {
			url: '/home',
			templateUrl: 'product.home.html',
		})	
        .state('app.product.selection', {
        	url: '/selection/:productSlug/:variantSlug',
			controller: 'ProductSelectionController'	
		})
        .state('app.product.browser', {
			url: '/browser',
            templateUrl: 'product.home.html',
            onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                $modal.open({
                    templateUrl: "product.browser.html",
                    backdrop: false,
                    size:'lg',
                    resolve: {
                    },
                    controller: 'ProductBrowserController'
                }).result.then(function(result) {
                    if (result) {
                        return $state.transitionTo("items");
                    }
                });
            }]
		})	
		// IMAGES STATES AND NESTED VIEWS ========================================
		.state('app.images', {
			url: '/images',
			abstract: true,
			templateUrl: 'image.html',
			controller: 'ImagesController'
		})
		.state('app.images.home', {
			url: '/home',
			templateUrl: 'images.home.html'
		})			
		.state('app.images.clip-art', {
			url: '/clip-art',
			templateUrl: 'images.clip-art.html',
            controller: 'ImagesGraphicsController'
		})		
		.state('app.images.add-graphic', {
			url: '/add-graphic/*path',
            controller: 'ImagesAddGraphicController'
		})
		.state('app.images.upload', {
			url: '/upload',
			templateUrl: 'images.upload.html',
            controller: 'ImagesUploadController'
		})
		.state('app.images.my-images', {
			url: '/my-images',
			templateUrl: 'images.my-images.html',
			controller: 'ImagesBoxController'
		})			
		.state('app.images.edit', {
			url: '/edit',
			templateUrl: 'images.edit.html',
			controller: 'ImagesEditController'
		})
		// TEXT STATES AND NESTED VIEWS ========================================
		.state('app.text', {
			url: '/text',
			abstract: true,
			templateUrl: 'viewer.html',
			controller: 'TextController'
		})
		.state('app.text.add', {
			url: '/add',
			templateUrl: 'text.add.html'
		})			
		.state('app.text.edit', {
			url: '/edit',
			templateUrl: 'text.edit.html',
            controller: 'TextEditController'
		})
		// BUY STATES AND NESTED VIEWS ========================================
		.state('app.buy', {
			url: '/buy',
            abstract: true,
            templateUrl: 'viewer.html',
			controller: 'BuyController'
		})
        .state('app.buy.home', {
			url: '/home',
			templateUrl: 'buy.home.html',
		});
		
});
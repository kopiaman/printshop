angular.module('app').service('ProductService', function( ApiService, $http, $q ) {

	//store a list of products and categories
	this.categories = null;
	this.products = null;
	this.orientations = null;

	this.setOrientation = function(value){
		this.currentOrientation = value;
	};

	this.getOrientation = function(){
		return this.currentOrientation;
	};

	this.getOrientations = function(){
		return this.orientations;
	};
    
    this.getProducts = function() {
    	var self = this;
    	var deferred = $q.defer();
        $http({method: 'GET', url: ApiService.Url("get_products.php"), cache: true}).
            success(function(data, status, headers, config) {
                
                self.categories = data.categories;
                self.products = data.products;
            	deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                deferred.reject(data);
            });
		return deferred.promise;
    };

});

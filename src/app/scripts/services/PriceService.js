angular.module('app').service('PriceService', function( localStorageService, ApiService, $http, $q ) {
    
    this.currency_code = 'USD';
    this.currency_symbol = '$';

	this.layers = null;
	this.delivery = false;
	this.quantities = false;
	this.price = 0;

	this.pricing = null;
	this.deliveryTypes = null;
	this.charges_per_side = null;
	this.bulk_discounts = null;

	this.getPricing = function(value){
		var self = this;
    	var deferred = $q.defer();

        //load pricing
        $http({method: 'GET', url: ApiService.Url("get_pricing.php"), cache: false}).
            success(function(data, status, headers, config) {
                self.pricing = data.pricing;
                self.deliveryTypes = data.delivery_types;
                self.charges_per_side = data.charges_per_side;
                self.bulk_discounts = data.bulk_discounts;
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
				deferred.reject(data);
            });

		return deferred.promise;
	};

	this.setPrice = function(value){
        localStorageService.set('checkout.price', value);
		this.price = value;
	};

	this.setPostage = function(value){
        localStorageService.set('checkout.postage', value);
		this.postage = value;
	};

	this.setPostageDescription = function(value){
        localStorageService.set('checkout.postage_description', value);
	};
	
	this.setQuantities = function(value){
        localStorageService.set('checkout.quantities', value);
		this.quantities = value;
	};

	this.setTitle = function(value){
        localStorageService.set('checkout.title', value);
	};
	this.setDescription = function(value){
        localStorageService.set('checkout.description', value);
	};
	this.setDelivery = function(value){
        localStorageService.set('checkout.delivery', value);
		this.delivery = value;
	};

	this.setLayers = function(value){
        localStorageService.set('checkout.layers', value);
		this.layers = value;
	};

	this.getPrice = function(){
        var price = localStorageService.get('checkout.price');
        if(price == null)
            price = 0;
		return price;
	};

	this.getQuantities = function(){
        var quantities = localStorageService.get('checkout.quantities');
        if(quantities == null)
            quantities = {};
		return quantities;
	};
    
	this.getDescription = function(){
        var description = localStorageService.get('checkout.description');
		return description;
	};
        
	this.getTitle = function(){
        var title = localStorageService.get('checkout.title');
		return title;
	};
    
	this.getTotalQuantity = function(){
        var quantities = this.getQuantities();
        var quantity =  _.reduce(quantities, function(memo, num)
                    {
                        num = parseInt(num);
                        return memo + num;
                    }, 0);
		return quantity;
	};

	this.getDelivery = function(){
        var delivery = localStorageService.get('checkout.delivery');
		return delivery;
	};
    
	this.getPostageDescription = function(){
        var postage_description = localStorageService.get('checkout.postage_description');
		return postage_description;
	};
    
	this.getPostage = function(){
        var postage = localStorageService.get('checkout.postage');
        if(postage == null)
            postage = 0;
		return postage;
	};

	this.setCurrency = function(currency_code){
    	this.currency_code = currency_code;
	};

	this.setCurrencySymbol = function(currency_symbol){
		this.currency_symbol = currency_symbol;
	};

	this.getCurrency = function(){
		return this.currency_code;
	};

	this.getCurrencySymbol = function(){
		return this.currency_symbol;
	};

	this.getLayers = function(){
        var layers = localStorageService.get('checkout.layers');
        if(layers == null)
            layers = {};
		return layers;
	};
	
	this.format = function(price){
		return accounting.formatMoney(price, this.getCurrencySymbol());
	};


});

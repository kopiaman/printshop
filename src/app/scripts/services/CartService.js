angular.module('app').service('CartService', function( localStorageService, PriceService ) {

	this.cart = [];
	this.cumulativeCount = 0;
	this.itemId = 0;
	this.selectedItemId = 0;

	this.init = function(){
		
		var cart = localStorageService.get('cart.items');
		if(cart) {
			this.cart = cart;
		} else {
			this.cart = [];
		}

		var selectedItemId = localStorageService.get('cart.selectedItemId');
		if(selectedItemId) {
			this.selectedItemId = selectedItemId;
		} else {
			this.selectedItemId = 0;
		}

		this.cumulativeCount = this.cart.length;

	};
	
	this.reset = function(){
		localStorageService.remove('cart.items');
		localStorageService.remove('cart.selectedItemId');
		this.init();
	};

	this.setSelectedItem = function(selectedItemId){
		this.selectedItemId = selectedItemId;
		localStorageService.set('cart.selectedItemId', this.selectedItemId);
	};

	this.getSelectedItem = function(){
		var selectedItemId = localStorageService.get('cart.selectedItemId');
		if(selectedItemId) {
			this.selectedItemId = selectedItemId;
		} else {
			return false;
		}
		var item = _.find(this.cart, {id: this.selectedItemId});
		return item;
	};

	this.updateItem = function(product, variant, itemId){
		this.itemId = itemId;

		var item = _.find(this.cart, {id: this.itemId});
		item.id = this.itemId;
		item.product = product;
		item.variant = variant;
		item.orientations = {};
		item.price = variant.price; //base price
		item.single_price = variant.price; //base price

		item.quantities = {};
        _.each(product.sizes, function(size) {
            item.quantities[size] = 0;
        });

        item.total_quantity =  _.reduce(this.quantities, function(memo, num) {
                        	num = parseInt(num);
                        	return memo + num;
                    	}, 0);
		item.total_price = item.single_price * item.total_quantity;

		this.insert(item);
		this.setSelectedItem(this.itemId);
	};

	this.updateItemCanvas = function(orientation, canvas, itemId){
		this.itemId = itemId;
		var item = _.find(this.cart, {id: this.itemId});
		
		item.canvases[orientation] = canvas.toJSON(['original_colors', 'fontName']);

		//make the image - it's saved in local storage so we'll always have an image
		canvas.clone(function (data) {
            var new_canvas = data;
            item.images[orientation] = new_canvas.toDataURL();
        });
		
		item.layers = this.calculateLayers(item);
		
		item.single_price = this.calculateSinglePrice(item, item.layers.colors);
        item.total_quantity =  _.reduce(this.quantities, function(memo, num) {
                        	num = parseInt(num);
                        	return memo + num;
                    	}, 0);
		item.total_price = item.single_price * item.total_quantity;

		this.insert(item);
		localStorageService.set('cart.items', this.cart);
	};

	this.calculateLayers = function(item){
		//colors per side
        //get the active orientations
        var data = {};
        data.orientations = _.size( item.variant.orientations );
        data.orientations_designed = 0;
        data.orientations_layers = [];
        data.colors = {};
        _.each(item.variant.orientations, function(img, orientation) {
        	data.colors[orientation] = 0;
            var orientationObjects = item.canvases[orientation];
            var orientation_layers = {};
            
            data.orientations_designed = data.orientations_designed + 1;
            orientation_layers.name = orientation;

            if(!angular.isUndefined(orientationObjects)) {

                orientation_layers.count = orientationObjects.objects.length;
                orientation_layers.photos = _.size( _.where(orientationObjects.objects, {type:"image"}) );
                orientation_layers.text = _.size( _.where(orientationObjects.objects, {type:"i-text"}) );
                orientation_layers.graphics = _.size( _.where(orientationObjects.objects, {type:"path-group"}) );

                var fills = [];
                var colors = 0;
                //var fills = _.pluck(j.objects[0].paths, 'fill');
                _.each(orientationObjects.objects, function(object) {

                    if(object.type == "path-group") {
                        _.each(object.paths, function(path) {
                            if(path.fill.charAt(0) == '#') {
	                        	if(path.fill) {
	                            	fills.push(path.fill);
	                        	}
	                        	if(path.stroke) {
	                            	fills.push(path.stroke);
	                            }
                            }
                        });
                        
                    }
                    
                    if(object.type === 'i-text' || object.type === 'text' ) {
                        _.each(object.paths, function(path) {
                        	if(object.fill) {
                            	fills.push(object.fill);
                        	}
                        	if(object.stroke) {
                            	fills.push(object.stroke);
                            }
                        });
                    }                    
                    if(object.type === 'image' ) {
                        fills.push('INF');
                    }

                });

                orientation_layers.fills = _.uniq(fills);
                data.colors[orientation] = _.size(orientation_layers.fills);
                if(_.contains(fills, 'INF')) {
					data.colors[orientation] = 'INF';
                }
            } else {

                orientation_layers.colors = 0;
                orientation_layers.count = 0;
                orientation_layers.photos = 0;
                orientation_layers.text = 0;
                orientation_layers.graphics = 0;
                orientation_layers.fills = [];
                data.colors[orientation] = 0;

            }

            data.orientations_layers.push(orientation_layers);

        });

        return data;
	};
	
	//here we calculate the total price for one item
	this.calculateSinglePrice = function(item, colors){

		var price = parseFloat(item.variant.price);
		price += this._calculateLayerCost(item);

        return price;

	};

	this._parseTextLayer = function(layer){
		var colors = [];
		colors.push(layer.fill);
		colors.push(layer.stroke);
		return colors;
	};

	this._parseGraphicLayer = function(layer){
		var colors = [];
		_.each(layer.paths, function(path) {
			colors.push(path.fill);
			colors.push(path.stroke);
		});
		return colors;
	};

	this._cleanColors = function(colors){
		//get rid of duplicates
		colors = _.unique(colors);
		var color_list = [];
		_.each(colors, function(color) {
			if(color && color.charAt(0) == '#') {
				color_list.push(color);
			}
		});
		return color_list;
	};

	this._calculateOrientationPrice = function(colors, has_photo){
		var pricing = PriceService.pricing;
		
		var total_colors = _.size(colors);
		var max_count_set = _.size(pricing);
		if(total_colors > max_count_set || has_photo) {
			total_colors = 'INF';
		}

		var price = 0;
		if( !_.isUndefined(pricing[total_colors]) ) {
			price = parseFloat(pricing[total_colors]);
		}
		return parseFloat(price);
	};

	this._calculateLayerCost = function(item){

		var colors = {};
		var orientation_pricing = {};
		var self = this;
        var charges_per_side = PriceService.charges_per_side;
        
		_.each(item.canvases, function(layers, orientation) {
			colors[orientation] = [];
			var has_photo = false;

			_.each(layers.objects, function(layer) {

				if(_.isEqual(layer.type, 'text') || _.isEqual(layer.type, 'i-text') ) {
					colors[orientation] = colors[orientation].concat(self._parseTextLayer(layer));
				}			
				if( _.isEqual(layer.type, 'path-group') ) {
					colors[orientation] = colors[orientation].concat(self._parseGraphicLayer(layer));
				}			
				if( _.isEqual(layer.type, 'image') ) {
					has_photo = true;
				}
			});

			colors[orientation] = self._cleanColors(colors[orientation]);
			orientation_pricing[orientation] = self._calculateOrientationPrice(colors[orientation], has_photo);

        });

		var total_pricing = _.reduce(_.values(orientation_pricing), function(sum, el) {
		  return sum + el
		}, 0);

        //this adds additional pricing per side
        var total_sides = _.reduce(_.values(colors), function(sum, el) {
            var has_content = (_.size(el) > 0 ? 1 : 0);
            return sum + has_content;
		}, 0);
        
        var sideCharge = _.find(charges_per_side, {'sides' : total_sides});        
        if(!_.isUndefined(sideCharge)) {
            total_pricing = total_pricing + sideCharge.price;
        }
        //console.log( "additional pricing per side", total_pricing );
        
		return total_pricing;
	};


	this.sumQuantities = function(quantities){
		localStorageService.set('cart.items', this.cart); //just to update the quantities
        var quantity =  _.reduce(quantities, function(memo, num){
                            num = parseInt(num);
                            return memo + num;
                        }, 0);
        return quantity;
    };

    this.sumPrice = function(quantities, price){
        var quantity = this.sumQuantities(quantities);
        price = accounting.unformat(price);
        var sum_price = price * quantity;
        
        //ist the quantity between 
        var discount_rate = 0;
        _.each(PriceService.bulk_discounts, function(bulk_discount) {
            
            var price_upper_limit = (bulk_discount['to'] == 'INF' ? Number.POSITIVE_INFINITY : parseInt(bulk_discount['to']));
            //console.log(quantity, bulk_discount['from'], price_upper_limit, bulk_discount['discount']);
            if( quantity >= parseInt(bulk_discount['from']) && quantity <= price_upper_limit ) {
                discount_rate = parseFloat(bulk_discount['discount']);
            }
        });
        
        if(discount_rate > 0) {
            var discount = sum_price*(discount_rate/100);
            sum_price = sum_price - discount;
        }
        
        return sum_price;
    };   

    this.sumTotalPrice = function(){
 
        var total_price = 0;
		var self = this;
        _.each(this.cart, function(item) {
			item.total_quantity =  _.reduce(item.quantities, function(memo, num) {
			                	num = parseInt(num);
			                	return memo + num;
			            	}, 0);
			item.total_price = self.sumPrice(item.quantities, item.single_price);
			item.discount_price = (item.total_price/item.total_quantity);
            total_price += item.total_price;
        });
        
        return total_price;

    };

	this.generateUUID = function(){
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	};

	this.newItem = function(product, variant){
		this.itemId = this.generateUUID();

		//each item needs this
		var item = {};
		item.id = this.itemId;
		item.product = product;
		item.variant = variant;
		item.orientations = {};
		item.price = variant.price; //base price
		item.single_price = variant.price; //base price
		item.total_price = 0; //no quantity
		item.total_quantity = 0; //no quantity
		item.canvases = {}; //store the canvas for each orientation here
		item.images = {}; //store the canvas images
		item.layers = {}; //store the layers for each orientation
		
		item.quantities = {};
        _.each(product.sizes, function(size) {
            item.quantities[size] = 0;
        });

		this.insert(item);
		this.setSelectedItem(this.itemId);
		return item;
	};
	
	this.duplicateItem = function(item){
		this.itemId = new Date().getUTCMilliseconds();

		//each item needs this
		var newItem = jQuery.extend(true, {}, item);
		newItem.id = this.itemId;

		this.insert(newItem);
		this.setSelectedItem(this.itemId);
		return newItem;
	};

	this.insert = function(item){

		var exists = _.find(this.cart, {id: item.id});

		if(exists) {
			var index = _.indexOf(this.cart, exists);
			
			this.cart[index] = _.extend(this.cart[index], item);
		} else {
	        this.cart.push({
	            id          	:   item.id,
	            product  		:   item.product,
	            variant  		:   item.variant,
	            orientations  	:   item.orientations,
	            quantities  	:   item.quantities,
	            canvases  		:   item.canvases,
	            images  		:   item.images,
	            price       	:   item.price,	            
	            single_price    :   item.single_price,
	            total_price    	:   item.total_price,
	            total_quantity 	:   item.total_quantity
	        });
	        this.cumulativeCount += 1;
    	}

        localStorageService.set('cart.items', this.cart);
	};
    
	this.update = function(orientation, canvas){

	};    
    
	this.remove = function(itemId){
		this.cart = _.without(this.cart, _.findWhere(this.cart, {id: itemId}));
		
		localStorageService.set('cart.items', this.cart);

		if(this.selectedItemId == itemId) {
			var first = _.first(this.cart);
			if(first) {
				this.setSelectedItem(first.id);	//select first item
			}
		}

	};    
    
	this.destroy = function(orientation, canvas){

	};
    
	this.totalItems = function(orientation, canvas){

	};
    
	this.getTotalPrice = function(){
		return 20;
	};
    
	this.getItems = function(){
		return this.cart;
	};

	this.init();

});

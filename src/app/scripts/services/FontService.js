angular.module('app').service('FontService', function( localStorageService, ApiService, $q, $interval, $http ) {

	this.fonts = {};
	this.fontList = [];
	this.fontCategories = [];

	this.init = function(){
		
		var fonts = localStorageService.get('fonts');
		if(fonts) {
			this.fonts = fonts;
		}

	};

	this.loadFont = function(font){
		//console.log('loadFont', font.regular.fontface);
		if (!isFontAvailable(font.regular.fontface)) {
			$('head').append('<link rel="stylesheet" type="text/css" href="'+ApiService.fontUrl(font.regular.stylesheet)+'">');
		}
		this.fonts[font.name] = font;
		localStorageService.set('fonts', this.fonts);
	};

	this.preloadFonts = function(){

		var self = this;
    	var deferred = $q.defer();

    	_.each(self.fonts, function(font) {
			if (!isFontAvailable(font.regular.fontface)) {
                        
				var fontRow = _.find(self.fontList, {name: font.name});
				if(!angular.isUndefined(fontRow)) {

					$('head').append('<link rel="stylesheet" type="text/css" href="'+ApiService.fontUrl(font.regular.stylesheet)+'">');
			        var stop = $interval(function() {
			          if (isFontAvailable(font.regular.fontface)) {
			            canvas.renderAll();
			            $interval.cancel(stop);
			          }
			        }, 100);

		        }
			}
		});
		deferred.resolve(self.fonts);
		return deferred.promise;

	};

	this.getFonts = function() {

		var self = this;
    	var deferred = $q.defer();

        $http({method: 'GET', url: ApiService.Url("fonts.php"), cache: false}).
        success(function(data, status, headers, config) {
            self.fontList = data;
            self.fontCategories = _.uniq(_.pluck(self.fontList, 'category'));
            deferred.resolve(self);
        }).
        error(function(data, status, headers, config) {
			deferred.reject(data);
        });
		return deferred.promise;

    }

	this.init();

});

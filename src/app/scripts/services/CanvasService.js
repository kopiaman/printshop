angular.module('app').service('CanvasService', function( localStorageService ) {

	this.orientations = {};
	this.orientation_canvases = {};
	this.orientation_data = {};

	this.init = function(){
		
		var orientations = localStorageService.get('orientations');
		if(orientations) {
			this.orientations = orientations;
		}		
		var orientation_data = localStorageService.get('orientation_data');
		if(orientation_data != null) {
			this.orientation_data = orientation_data;
		}

	};

	this.setOrientationDesign = function(orientation, canvas){
		this.orientations[orientation] = canvas.toJSON(['original_colors', 'fontName']);
        this.orientation_canvases[orientation] = canvas;
        
		localStorageService.set('orientations', this.orientations);
		localStorageService.set('orientation_canvases', this.orientation_canvases);
	};

	this.generateOrientationImage = function(orientation, image_data){
        
        this.orientation_data[orientation] = {}
        this.orientation_data[orientation]['background'] = image_data.background;
        this.orientation_data[orientation]['offset_x'] = image_data.offset_x;
        this.orientation_data[orientation]['offset_y'] = image_data.offset_y;
        this.orientation_data[orientation]['image_width'] = image_data.image_width;
        this.orientation_data[orientation]['image_height'] = image_data.image_height;
        this.orientation_data[orientation]['background_width'] = image_data.background_width;
        this.orientation_data[orientation]['background_height'] = image_data.background_height;
                
        if(angular.isDefined(this.orientation_canvases[orientation])) {
            var canvas = this.orientation_canvases[orientation];
            this.orientation_data[orientation]['image'] = canvas.deactivateAll().toDataURL();
        } else {
            this.orientation_data[orientation]['image'] = null;
        }
        
        localStorageService.set('orientation_data', this.orientation_data);
            
	};

	this.getOrientationDesign = function(orientation){
		return this.orientations[orientation];
	};
	this.getOrientationImage = function(orientation){
		return this.orientation_data[orientation];
	};	
    this.getOrientationData = function(orientation){
		return this.orientation_data;
	};

	this.init();

});

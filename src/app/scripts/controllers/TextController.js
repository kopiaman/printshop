/**
 * 
 * Controller for adding text
 * 
 */
angular.module('app').controller('TextController', function( $scope, $location, $urlRouter, $stateParams, $state, $timeout, $http, ApiService, $interval, FontService) {
    this.name = "TextController";
    this.params = $stateParams;
    $scope.addText = "";
	window.scope = $scope;
    $scope._ = _;
    $scope.fonts = [];
    $scope.FontService = FontService;
    $scope.fontCategories = [];
    $scope.selectedFontCategory = 'Display';
    $scope.selectedFont = [];
    $scope.fontSelectionWindow = false;
    $scope.setActiveTab('text');
    $scope.$watch('isReady', function(newValue, oldValue) {
        $scope.loadFonts();
    });
	$scope.setSelectedFont = function(font) {
        $scope.selectedFont = font;
        $scope.hideFontSelector();
    }    
	$scope.showFontSelector = function() {
        $scope.fontSelectionWindow = true;
    }
    
	$scope.hideFontSelector = function() {
        $scope.fontSelectionWindow = false;
    }
    
	$scope.loadFonts = function() {
        //console.log('FontService.fontList', FontService.fontList);
        $scope.fonts = FontService.fontList;
        $scope.fontCategories = FontService.fontCategories;
        $scope.selectedFont = _.findWhere(window.scope.fonts, {name: $scope.defaultFont});
    }
    
	$scope.font_image = function(font_image) {
        return ApiService.fontUrl(font_image);
    }
    
	$scope.add_text = function() {
        
        //now add the stylesheet
        FontService.loadFont($scope.selectedFont);
		
		//set the control colors
        var fill = getBorderColor(_.first($scope.currentItem.variant.colors));
		
		var text = new fabric.Text($scope.addText, {
			left: 100,
			top: 10,
			fill: fill,
			fontFamily: $scope.selectedFont.regular.fontface,
			radius: 0,
			fontSize: 50,
            textAlign: 'center',
			spacing: 0
		});
		$scope.canvas.add(text);
		
		$scope.canvas.setActiveObject($scope.canvas.item($scope.canvas.getObjects().length - 1)); 
        $scope.canvas.item($scope.editableItem).centerH();

        console.log($scope.selectedFont.regular.fontface, isFontAvailable($scope.selectedFont.regular.fontface));
        var stop = $interval(function() {

          if (isFontAvailable($scope.selectedFont.regular.fontface)) {
            var object = $scope.canvas.item($scope.editableItem);

            object.setFontFamily( $scope.selectedFont.regular.fontface );
            object.set( 'fontName', $scope.selectedFont.name );
            $scope.defaultFont = $scope.selectedFont.name;

            //
            var max_width = $scope.canvas.width * 0.9;
            var max_height = $scope.canvas.height * 0.9;
            var new_width = max_width;
            if(object.getWidth() < max_width) {
                new_width = object.getWidth();
            }
            var width_ratio = new_width  / object.getWidth(); //find ratio
        
            var newfontsize = (object.fontSize * width_ratio)
            object.setFontSize(parseInt(newfontsize, 10));
            object.setScaleX(1);
            object.setScaleY(1);
            object.centerH();

            $scope.editable.fontSize = object.fontSize;

            $scope.drawCanvas();
            $interval.cancel(stop);

            if($scope.isMobile) {
                $scope.editMode = 'text';
                $state.go('app.product.home');
                $scope.showMobileDesigner();
            }
          }
        }, 100);

		$scope.drawCanvas();
	  
	};
    
    $scope.setFontCategory = function(category) {
        $scope.selectedFontCategory = category;  
    };
}); 
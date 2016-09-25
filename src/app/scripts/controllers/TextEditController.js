/**
 * 
 * Controller for editing text
 * 
 */
angular.module('app').controller('TextEditController', function( $scope, $location, $urlRouter, $stateParams, $state, $timeout, ApiService, $http, $interval, FontService) {
    this.name = "TextEditController";
    this.params = $stateParams;
	$scope.currentText = "";
	$scope.item;
	window.textScope = $scope;
    $scope.setActiveTab('text');
    
    $scope.eventColors = [
        {name: "Black",      value: '#000000'},
        {name: "Green",      value: '#7bd148'},
        {name: "BoldBlue",   value: '#5484ed'},
        {name: "Blue",       value: '#a4bdfc'},
        {name: "Turquoise",  value: '#46d6db'},
        {name: "LightGreen", value: '#7ae7bf'},
        {name: "BoldGreen",  value: '#51b749'},
        {name: "Yellow",     value: '#fbd75b'},
        {name: "Orange",     value: '#ffb878'},
        {name: "Red",        value: '#ff887c'},
        {name: "BoldRed",    value: '#dc2127'},
        {name: "Purple",     value: '#dbadff'},
        {name: "Gray",       value: '#e1e1e1'}
    ];

    $scope.palette = [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
    ];
    
    $scope.selectedColor = $scope.eventColors[0];
    $scope.strokeColor = $scope.eventColors[1];
    $scope.angle = 0;
    $scope.fontSize = 12;
    $scope.outline = false;
    $scope.spinnerExample = 20;
    $scope._ = _;

    $scope.selectedFontCategory = 'Display';
	$scope.radius = 50;
	$scope.fontSize = 20;
	$scope.spacing = 0;
	$scope.strokeWidth = 20;
    $scope.$watch('isReady', function(newValue, oldValue) {
        $scope.loadFonts();
    });
    $scope.$watch('editableItem', function() {
        console.log('editableItem - TEXT', $scope.editableItem);
        if($scope.editableItem != null) {
            var item = $scope.canvas.item($scope.editableItem);
            if(item.type == 'i-text' || item.type == 'text' ) {
                $scope.init();
            }
        }
    });
    $scope.setFontCategory = function(category) {
        $scope.selectedFontCategory = category;  
    };
    
    $scope.flipHorizontal = function() {
        $scope.canvas.item($scope.editableItem).toggle('flipY');
        $scope.drawCanvas();
    };        

    $scope.flipVertical = function() {
        $scope.canvas.item($scope.editableItem).toggle('flipX');
        $scope.drawCanvas();        
    };       

    $scope.setHorizontalCenter = function() {
        $scope.canvas.item($scope.editableItem).centerH();
        $scope.drawCanvas();
    };        

    $scope.setVerticalCenter = function() {
        $scope.canvas.item($scope.editableItem).centerV();
        $scope.drawCanvas();        
    };

    $scope.toggleBold = function(hex) {
        if($scope.editable.bold) {
            $scope.editable.bold = false;
            $scope.canvas.item($scope.editableItem).setFontWeight('normal');
        } else {
            $scope.editable.bold = true;
            $scope.canvas.item($scope.editableItem).setFontWeight('bold');
        }
        $scope.drawCanvas();
    }    
    $scope.toggleItalic = function(hex) {
        if($scope.editable.italic) {
            $scope.editable.italic = false;
            $scope.canvas.item($scope.editableItem).setFontStyle('normal');
        } else {
            $scope.editable.italic = true;
            $scope.canvas.item($scope.editableItem).setFontStyle('italic');
        }
        $scope.drawCanvas();
    }    

    $scope.changeStroke = function() {
        if($scope.outline == false) {
            $scope.editable.stroke = null;
        }
        $scope.canvas.item($scope.editableItem).setStroke($scope.editable.stroke);
        var thickness = $scope.editable.strokeWidth/100;
        thickness = thickness * 5;
        console.log('changeStroke', $scope.editable.stroke, thickness);
        $scope.canvas.item($scope.editableItem).setStrokeWidth(thickness);
        $scope.drawCanvas();
    }
       
    $scope.changeFill = function(hex) {
        $scope.canvas.item($scope.editableItem).setFill(hex);
        $scope.drawCanvas();
    }
        
    $scope.changeText = function(text) {
        $scope.canvas.item($scope.editableItem).setText($scope.editable.text);
        $scope.drawCanvas();
    }        

    $scope.changeFontSize = function() {
        $scope.canvas.item($scope.editableItem).setFontSize($scope.editable.fontSize);
        $scope.drawCanvas();
    }
        
	$scope.align = function(layout) {
        $scope.editable.textAlign = layout;
        $scope.canvas.item($scope.editableItem).setTextAlign(layout);
        $scope.drawCanvas();
    }
	
    $scope.setSelectedFont = function(font) {
        $scope.selectedFont = font;
        FontService.loadFont($scope.selectedFont);
        $scope.canvas.item($scope.editableItem).setFontFamily( $scope.selectedFont.regular.fontface );
        $scope.canvas.item($scope.editableItem).set( 'fontName', $scope.selectedFont.name );

        //console.log($scope.selectedFont.regular.fontface, isFontAvailable($scope.selectedFont.regular.fontface));
        var stop = $interval(function() {
            console.log($scope.selectedFont.regular.fontface, isFontAvailable($scope.selectedFont.regular.fontface));
          if (isFontAvailable($scope.selectedFont.regular.fontface)) {

            $scope.canvas.item($scope.editableItem).setFontFamily( $scope.selectedFont.regular.fontface );
            $scope.canvas.item($scope.editableItem).set( 'fontName', $scope.selectedFont.name );
            $scope.drawCanvas();
            $interval.cancel(stop);
          }
        }, 100);

        $scope.drawCanvas();
        $scope.hideFontSelector();
    }
    $scope.showFontSelector = function() {
        if($scope.selectedFont) {
           $scope.selectedFontCategory = $scope.selectedFont.category;
        }
        $scope.fontSelectionWindow = true;
    }
    
    $scope.hideFontSelector = function() {
        $scope.fontSelectionWindow = false;
    }
    $scope.loadFonts = function() {
        $scope.fonts = FontService.fontList;
        $scope.fontCategories = FontService.fontCategories;
        $scope.selectedFont = _.findWhere(window.scope.fonts, {name: $scope.defaultFont});
    }

    $scope.font_image = function(font_image) {
        return ApiService.fontUrl(font_image);
    }

    $scope.init = function() {

        //wait for font to load
        var stop = $interval(function() {
            var fontName = $scope.canvas.item(scope.editableItem).get('fontName');
            if(!angular.isUndefined(fontName)) {
                $scope.selectedFont = _.findWhere($scope.fonts, {name: fontName}); 
                $interval.cancel(stop);
            }
        }, 100);

        if($scope.editable.stroke != null) {
            $scope.outline = true;   
        }

    }

});
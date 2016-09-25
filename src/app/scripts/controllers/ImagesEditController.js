/**
 * 
 * Controller for editing images
 * 
 */
angular.module('app').controller('ImagesEditController', function( $scope, $location, $urlRouter, $stateParams, $state) {
	    $scope.colors = null;
	    $scope.item = null;
	    $scope.canvasHeight = null;
	    $scope.canvasWidth = null;
        window.imageScope = $scope;
        $scope.setActiveTab('images');

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
    
        $scope.options = {
            width: 90,
            height: 90,            
            min: 0,
            max: 360,
            fgColor: "#428BCA",
            displayPrevious: false,
            readOnly: false,
            cursor:true,
            thickness: ".3"
        }

        $("#rotation-image").knob(
            {
            width: 90,
            height: 90,            
            min: -1,
            max: 360,
            fgColor: "#428BCA",
            displayPrevious: false,
            readOnly: false,
            cursor:10,
            thickness: ".3",
            'change' : function (v) {
                var object = canvas.getActiveObject();
                if(object != null) {
                    object.setAngle(v);
                    canvas.renderAll();
                }
            },
            'release' : function (v) {
                var object = canvas.getActiveObject();
                if(object != null) {
                    object.setAngle(v);
                    canvas.renderAll();
                }
            }
        });

        $scope.scaleX = null;
        $scope.scaleY = null;        
        $scope.scaleX_perc = null;
        $scope.scaleY_perc = null;
        $scope.angle = 0;
        $scope.original_colors = null;
    
        $scope.outline = false;
        $scope.strokeColor = $scope.eventColors[1];
        $scope.strokeWidth = 20;
    

        $scope.$watch('editableItem', function() {
            console.log('editableItem', $scope.editableItem);
            if($scope.editableItem != null) {
                var item = $scope.canvas.item($scope.editableItem);
                if(item.type != 'i-text' && item.type != 'text' ) {
                    $scope.init();
                }
            }
        });    

        $scope.$watch('colors', function() {
            console.log('colors changed');
            $scope.updateColors();
        }, true);

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
        
        $scope.beforeShow = function(color) {
            console.log('beforeShow', color);
        }

        $scope.updateColors = function() {
            

            _.each($scope.editable.original_colors, function(path, index) {

                var fill = _.find($scope.colors, {original:path.fill});

                if(fill && fill.replacement != null) {
                    console.log('updateColors', $scope.editable.paths[index].fill, fill.replacement);

                    $scope.editable.paths[index].fill = fill.replacement;
                }

            });
            
            //now update the view
            var item = $scope.canvas.item($scope.editableItem);
            if(item != null) {
                item.set('paths', $scope.editable.paths);
                item.original_colors = $scope.original_colors;
            }
            $scope.drawCanvas();

        };

        $scope.switchColor = function(color, replacement) {
            
            color.replacement = replacement;
            $scope.updateColors();
            
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
		
	  	$scope.init = function() {

            $scope.colors = [];
            $scope.original_colors = [];

            if($scope.editable.type == 'path-group') { //it's an image
                
                if( angular.isUndefined($scope.editable.original_colors) || $scope.editable.original_colors == null) {
                    $scope.original_colors = {};
                } else {
                    $scope.original_colors = $scope.editable.original_colors;                    
                }
                
                _.each($scope.editable.paths, function(path, index) {

                    if(angular.isUndefined($scope.original_colors[index])) {
                        $scope.original_colors[index] = {};
                        $scope.original_colors[index].fill = path.fill;
                    }

                    if(angular.isUndefined(path.fill.type)) {
                        if($.inArray(path.fill, $scope.colors) === -1) {
                            if(path.fill.charAt(0) == '#') {
                                
                                var original_fill = $scope.original_colors[index].fill;
                                if(!_.find($scope.colors, {original:original_fill})) {
                                    $scope.colors.push({original:original_fill, replacement:path.fill});
                                }

                            }
                        }
                    }
                    $scope.editable.original_colors = $scope.original_colors;
                });
            }
		
		};
	
});
/**
 * 
 * Controller for clip art
 * 
 */
angular.module('app').controller('ImagesAddGraphicController', function( $scope, $location, $urlRouter, $stateParams, $http, $timeout, ApiService, $state) {
    
    this.name = "ImagesAddGraphicController";
    this.params = $stateParams;

    $scope._ = _;
    $scope.clipArt = null;
    $scope.categories = null;
    window.scope = $scope;

    $scope.setActiveTab('images');

    $scope.addClipart = function(img) {
        console.log($scope.clipArtImage(img));
        fabric.loadSVGFromURL($scope.clipArtImage(img), function(ob,op){
            
            $scope.canvas.add(new fabric.PathGroup(ob, op).set({ left: 100, top: 100 }));
            $scope.canvas.setActiveObject($scope.canvas.item($scope.canvas.getObjects().length - 1));
            
            var max_width = $scope.canvas.width * 0.9;
            var max_height = $scope.canvas.height * 0.9;

            var new_width = max_width;
            if(op.width < max_width) {
                new_width = op.width;
            }

            //find ratio
            var width_ratio = new_width  / op.width;
            var new_height = op.height * width_ratio;
            console.log("still too big");
            if(new_height > max_height) { //still too big
                new_height = max_height;
                var height_ratio = new_height / op.height;
                new_width = op.width * height_ratio;
            }

            $scope.canvas.getActiveObject().set({
                scaleX:(new_width/op.width),
                scaleY:(new_height/op.height)
            }).center().setCoords();
            $scope.canvas.setActiveObject($scope.canvas.item($scope.canvas.getObjects().length - 1));
            $scope.drawCanvas();
            
            //make sure it's selected and updated
            $scope.canvas.setActiveObject($scope.canvas.item($scope.canvas.getObjects().length - 1));
            $scope.drawCanvas();

            //
            if($scope.isMobile) {
                $state.go('app.product.home');
                $scope.showMobileDesigner();
            } else {
				$state.go('app.images.clip-art');
			}
        });

    };

    $scope.clipArtImage = function(clipArt) {
        return ApiService.Url('../data/clip_art/' + clipArt);
    }
	
    $scope.$watch('isReady', function(newValue, oldValue) {
		if($scope.isReady) {
			$scope.addClipart($stateParams['path']);
		}
    });
	
    $scope.init = function() {
		if($scope.isReady) {
			$scope.addClipart($stateParams['path']);
		}
    };
    $scope.init();

});
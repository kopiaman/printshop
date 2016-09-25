/**
 * 
 * Controller for adding images
 * 
 */
angular.module('app').controller('ImagesController', function( $scope, $location, $urlRouter, $state, $stateParams, $http, $timeout, ApiService) {
    
    this.name = "ImagesController";
    this.params = $stateParams;

    $scope._ = _;
    window.scope = $scope;
    $scope.isHome = ($state.name == 'app.images.home');
    $scope.setActiveTab('images');

    $scope.$on('$stateChangeSuccess', 
        function(event, toState, toParams, fromState, fromParams){
            $scope.isHome = (toState.name == 'app.images.home');
        }
    );
    
    /*$scope.isHome = function() {
        return ($state.name == '' )
    };*/    
    
    $scope.uploadURL = function(src) {
        return ApiService.uploadURL(src);
    };

    $scope.addImage = function(img) {
        fabric.Image.fromURL(img, function(op){
            
            $scope.canvas.add(op);
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

        });
    };
    
    
    $scope.init = function() {
    };
    $scope.init();

});
angular.module('app').controller('ImagesBoxController', function( $scope, $location, $urlRouter, $stateParams, $http, $timeout, ApiService) {
    
    this.name = "ImagesBoxController";
    this.params = $stateParams;

    $scope._ = _;
    window.scope = $scope;
    
    $scope.myImages = [];
    $scope.setActiveTab('images');
    
    $scope.loadMyImages = function() {

        $http({method: 'GET', url: ApiService.Url("my_images.php"), cache: false}).
        success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.myImages = data.images;
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    
    $scope.init = function() {
        $scope.loadMyImages();
    };
    $scope.init();

});
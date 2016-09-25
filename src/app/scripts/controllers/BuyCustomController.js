/**
 * The checkout screen + stripe integration
 */
angular.module('app').controller('BuyCustomController', function( $scope, $window, customUrl, title) {
	this.name = "BuyCustomController";
    $scope.customUrl = customUrl;
    $scope.title = title;


    $scope.launchPayment = function() {
        openCustomWindow($scope.customUrl);
        //$window.open($scope.customUrl,"_blank","width=1024,height=768,location=1,resizable=1,scrollbars=1,status=1", true);
    };

    
});

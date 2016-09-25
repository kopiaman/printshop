/**
 * After completing the purchace we land here
 * order is passed from the Checkout after stripe
 */
angular.module('app').controller('BuyConfirmationController', function( $scope, $state, CartService, order) {
    this.name = "BuyConfirmationController";
    window.scope = $scope;
    window.state = $state;
    $scope.order = order;

    $scope.dismiss = function() {
        $scope.$dismiss();
    };

    $scope.init = function() {   
        $state.go('app.home');
    };

    $scope.init();
    
});
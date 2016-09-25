/**
 * Select the payment method
 */
angular.module('app').controller('BuyPaymentMethodController', function( $scope, $state, $modalInstance, paymentMethods) {
    this.name = "BuyPaymentMethodController";
    window.scope = $scope;
    window.state = $state;
    $scope.paymentMethods = paymentMethods;
    $scope.selectedMethod = null;

    $scope.dismiss = function() {
        $modalInstance.$dismiss();
    };

    $scope.select = function() {
        $modalInstance.close($scope.selectedMethod);
    };

    $scope.init = function() {   
        console.log('$scope.paymentMethods', $scope.paymentMethods);
        $scope.selectedMethod = _.first($scope.paymentMethods).slug;
    };

    $scope.init();
    
});
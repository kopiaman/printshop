var app = angular.module('imgpreload', []);

app.directive('spinnerOnLoad', function() {
    return {
        restrict: 'A',
        link: function(scope,element){
            element.on('load', function() {
                element.removeClass('spinner-hide');
                element.addClass('spinner-show');
                element.parent().find('span').remove();
            });
            scope.$watch('ngSrc', function() {
                element.addClass('spinner-hide');
                element.parent().append('<span class="spinner"></span>');
            });      
        }
    }
});
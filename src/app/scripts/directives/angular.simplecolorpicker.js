var app = angular.module('simplecolorpicker', []);

//This directive is for the individual buttons.
//I thought it might be easier to break things up.
app.directive("scpButton", function() {
  var fakeText = '&nbsp;&nbsp;&nbsp;&nbsp;';
  return {
    restrict: 'E',
    template: '<div '
            + ' title="{{titleText || color.name}}"'
            + ' style="background-color: {{color.value}}"'
            + ' ng-class="getClass()"'
            + ' ng-click="clicked()"'
            + ' role="button" tabindex="0">' + fakeText
            + '</div>',
    replace: true,
    scope: {
      'titleText': '=',
      'color' : '=scpColor',
      'class' : '@class',
      'currentColor' : '=scpCurrentColor'
    },
    link: function(scope, element, attrs) {
      scope.clicked = function() {
        if(element.hasClass('button')) {
          scope.$parent.selectColor(scope.color);
        }
      }
      scope.getClass = function() {
        return scope.currentColor == scope.color && "selected" || "";
      }
    }
  };
  
});

//This directive drives the whole picker.
app.directive('simplecolorpicker', function() {
  return {
    restrict: 'E',
    template: '<span class="simplecolorpicker inline" ng-show="picker">'
            + '<scp-button class="simplecolorpicker icon" scp-color="currentColor"></scp-button>'
            + '</span>'
            + '<span ng-class="getClass()">'
            + '<scp-button class="simplecolorpicker button" ng-repeat="color in colors" scp-current-color="currentColor" scp-color="color"></scp-button>'
            + '</span>',
    replace: false,
    scope: {
        'colors': '=scpColors',
        'currentColor' : '=scpColor',
        'picker': '=scpPicker',
        'model':'='
    },
    link: function(scope, element, attrs) {
      //DOM functions here, they should probably be extracted out.
      //They have to account for the fact that the class is not available on
      // first run in all cases.
        var $icon = element.find('.icon') 
        var showPicker = function(){
          var $picker = element.find('.picker');
          var bootstrapArrowWidth = 16; // Empirical value
          var pos = $icon.position();
            
          $picker.css({
            left: pos.left + $icon.width() / 2 - bootstrapArrowWidth, // Middle of the icon
            top: pos.top + $icon.outerHeight()
          });
          $picker.show()
      };
      var hidePicker = function() {
        var $picker = element.find('.picker');
        if($picker.is(":visible")) {
          $picker.hide();
        }
      }
      var mouseDown = function(e) {
        e.stopPropagation();
        e.preventDefault();
      }
      //Event handling.
      $(document).on('mousedown', hidePicker);
      $icon.on('mousedown', showPicker);
      $(element).on('mousedown', '.picker, .icon', mouseDown);
      
      //This watch is neccessary to make sure the list of buttons gets
      //shown again when the picker option is turned off.
      //Neccessary because of the way hidePicker works currently.
      scope.$watch('picker', function(newVal, oldVal) {
        if(newVal == false) {
          element.find('.colors').show()
        }
      });
      
      //Scope functions, directives can have builtin controllers so that
      //would probably be best but this works for now.
      scope.getClass = function () {
        return [
          "simplecolorpicker",
          "colors",
          scope.picker && 'picker' || 'inline'
        ]
      }
      
      scope.selectColor = function(color) {  
		scope.currentColor = color;
		scope.model[attrs.scpColor] = color;
		//    scope.$apply();
		//scope.$parent.setSelectedColor(color);
      }
      
    }
      
  };
});

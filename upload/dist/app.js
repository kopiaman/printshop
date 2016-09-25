/*!
 * PrintPixel - A shopping cart for printing custom products
 * Version: 1.0 - December 2014
 * Author: ExpressPixel
 * Website: http://expresspixel.com/
 *
 *
 * Copyright 2012, 2015 ExpressPixel.com
 *
 */
'use strict';

/**
 *  Checks if the font is available
 */
(function(c){var b,d,e,f,g,h=c.body,a=c.createElement("div");a.innerHTML='<span style="'+["position:absolute","width:auto","font-size:128px","left:-99999px"].join(" !important;")+'">'+Array(100).join("wi")+"</span>";a=a.firstChild;b=function(b){a.style.fontFamily=b;h.appendChild(a);g=a.clientWidth;h.removeChild(a);return g};d=b("monospace");e=b("serif");f=b("sans-serif");window.isFontAvailable=function(a){return d!==b(a+",monospace")||f!==b(a+",sans-serif")||e!==b(a+",serif")}})(document);

/**
 *  A timer
 */
window.performance = window.performance || {};
performance.now = (function() {
    return performance.now       ||
        performance.mozNow    ||
        performance.msNow     ||
        performance.oNow      ||
        performance.webkitNow ||            
        Date.now  /*none found - fallback to browser default */
})();
String.prototype.shorten = String.prototype.trunc ||
function(n){
  return this.length>n ? this.substr(0,n-1)+'...' : this;
};

//sets the border color
function getBorderColor(hex) {
    var color = tinycolor(hex);
    if(color.isDark()) {
        return "#FFFFFF";
    } else {
        return "#000000";
    }
}

//show the waiting indicator
function show_indicator() {
    $('.loading-indicator').show();
}

//show the waiting indicator
function hide_indicator() {
    $('.loading-indicator').hide();
}

var canvas  = null;
var canvasContainerX = 0;
var canvasContainerY = 0;
(function(){
    
	//the dropdown cart
    $( "#cart .heading" ).bind( "click", function() {
        $('#cart').toggleClass('active');
        return false;
    });
	
    $(document).click(function(event) { 
        if($(event.target).parents().index($('#cart')) == -1) {
            if($('#cart').is(":visible")) {
                $('#cart').removeClass('active');
            }
        }        
    });
	
	//unselect when clicking
    $('#designer-product').click(function(event) { 
        if(
            $(event.target).parents().index($('#designer-container')) == -1 &&
            $(event.target).parents().index($('#layer-choice')) == -1
        ) {
            canvas.deactivateAllWithDispatch().renderAll();
        }        
    });

    //the option to show ordering of layers
    $('#layer-choice').hide();

    //this is to be able to drag the product after zooming
     $( "#designer-product" ).draggable({
        cancel : 'canvas'
    });
    $('#designer-product').draggable( "disable" );
    $("#designer-product").click(function(e){
        var offset = $(this).offset();
        
        canvasContainerX = e.pageX - offset.left;
        canvasContainerY = e.pageY - offset.top;

        if(
            $(e.target).parents().index($('#layer-choice')) == -1
        ) {
            $('#layer-choice').hide();
            $('#layer-choice').css({top: e.pageY+10+'px', left: e.pageX+'px'});
        }

    });
    
    //initiate the canvas
    canvas = new fabric.Canvas('designer-canvas');
    canvas.selection = false;

    //when selected show the relevant section
    canvas.on('selection:cleared', function (options) {
        var scope = angular.element(document.getElementById('designer-controller')).scope();
        scope.editMode = 'none';
        scope.canvas = canvas;
        if (scope.$root.$$phase !== '$apply' && scope.$root.$$phase !== '$digest') {
            scope.$apply();
        }
    });    

    //re-select item
    canvas.on('mouse:down', function (options) {

        var scope = angular.element(document.getElementById('designer-controller')).scope();
        var object = options.target; //This is the object selected 
        if (typeof object == 'undefined') {
            return;
        }

        if(object.type === 'i-text' || object.type === 'text' ) {
            scope.editMode = 'text';
            scope.$apply();
        } else {
            scope.editMode = 'image';
            scope.$apply();
        }


    });
	
	//highlight the item on mouseover
    canvas.on('mouse:over', function(e) {
        var thisItem = canvas.getObjects().indexOf(e.target);
        var selectedItem = canvas.getObjects().indexOf(canvas.getActiveObject());
        if(thisItem != selectedItem) {
            e.target.setShadow('1px 1px 1px rgba(102, 153, 255, 1)');
        } else {
            e.target.setShadow('');
        }
        canvas.renderAll();
    });
	
	//de-highlight the item on mouseout
    canvas.on('mouse:out', function(e) {
        e.target.setShadow('');
        canvas.renderAll();
    });
	
	//on select pass the required info to the root angularjs scope
    canvas.on('object:selected', function (options) {
        var scope = angular.element(document.getElementById('designer-controller')).scope();

        var object = options.target; //This is the object selected 
        var thisItem = canvas.getObjects().indexOf(canvas.getActiveObject());
        object.setShadow('');

        canvas.getActiveObject().set(
            {
                borderColor: "rgba(102, 153, 255, 1)",
                borderWidth: 10,
                hasRotatingPoint: false,
                cornerSize:12,
                borderOpacityWhenMoving: 1
            }
        );

        scope.editableItem = thisItem;
        scope.editable.angle = object.angle;

        //now we need to get the current item we're editing and also the orientation
        var angle = object.angle;
        if(object.angle > 360) {
            angle = angle - 360;
        }
        if(angle < 0) {
            angle = angle + 360;
        }
        angle = parseInt(angle);
        $('#rotation-image').val(angle).trigger('change');
        $('#rotation-text').val(angle).trigger('change');


        if(object.type === 'i-text' || object.type === 'text' ) {
            scope.editMode = 'text';
            scope.editable.text = object.getText();
            scope.editable.textAlign = object.getTextAlign();
            scope.editable.fill = object.getFill();
            scope.editable.stroke = object.getStroke();
            scope.editable.strokeWidth = object.getStrokeWidth() * 20;
            scope.editable.fontName = object.get('fontName');

            //set font size
            var newfontsize = (object.fontSize * object.scaleX)
            object.setFontSize(parseInt(newfontsize, 10));
            object.setScaleX(1);
            object.setScaleY(1);
            scope.editable.fontSize = object.fontSize;
            //set font size

            var font_weight = object.getFontWeight();
            scope.editable.bold = (font_weight == 'bold' ? true : false);

            var font_style = object.getFontStyle();
            scope.editable.italic = (font_style == 'italic' ? true : false);

        } else {
            scope.editable.type = object.type;
            scope.editable.original_colors = object.original_colors;
            scope.editable.paths = object.paths;
            scope.editable.stroke = object.getStroke();
            scope.editable.strokeWidth = object.getStrokeWidth() * 20;
            scope.editMode = 'image';
        }

        if (scope.$root.$$phase !== '$apply' && scope.$root.$$phase !== '$digest') {
            scope.$apply();
        }

        return;
    });

    //hide the layer thing
    canvas.on('object:scaling', function (options) {   
        $('#layer-choice').hide();
    });

    canvas.on('object:moving', function (options) {   
        $('#layer-choice').hide();
    });

    //on rotation we update the values shown
    canvas.on('object:rotating', function (options) {   
        $('#layer-choice').hide();
        var object = options.target; //This is the object selected 
        var scope = angular.element(document.getElementById('designer-controller')).scope();
        var thisItem = canvas.getObjects().indexOf(canvas.getActiveObject());


        //now we need to get the current item we're editing and also the orientation
        var angle = object.angle;
        if(object.angle > 360) {
            angle = angle - 360;
        }
        if(angle < 0) {
            angle = angle + 360;
        }
        angle = parseInt(angle);
        $('#rotation-image').val(angle).trigger('update');
        $('#rotation-text').val(angle).trigger('update');
        
        return;
    });

	//on modification we've got to update and save the scope
    canvas.on('object:modified', function (options) {	
        
        var object = options.target; //This is the object selected 
        var scope = angular.element(document.getElementById('designer-controller')).scope();
        var thisItem = canvas.getObjects().indexOf(canvas.getActiveObject());
        object.setShadow('');

        //now we need to get the current item we're editing and also the orientation
        scope.editableItem = thisItem;

        //then save the new canvas
        scope.canvas = canvas;
        scope.saveCanvas();

        //the fields we need to change
        var angle = object.angle;
        if(object.angle > 360) {
            angle = angle - 360;
        }
        if(angle < 0) {
            angle = angle + 360;
        }
        angle = parseInt(angle);
        scope.editable.angle = angle;
        $('#rotation-image').val(angle).trigger('change');
        $('#rotation-text').val(angle).trigger('change');
        if(object.type === 'i-text' || object.type === 'text' ) {
            scope.editMode = 'text';
            scope.editable.text = object.getText();
            scope.editable.textAlign = object.getTextAlign();
            scope.editable.fill = object.getFill();
            scope.editable.stroke = object.getStroke();
            scope.editable.strokeWidth = object.getStrokeWidth() * 20;
            scope.editable.fontName = object.get('fontName');

            //set font size
            var newfontsize = (object.fontSize * object.scaleX)
            object.setFontSize(parseInt(newfontsize, 10));
            object.setScaleX(1);
            object.setScaleY(1);
            scope.editable.fontSize = object.fontSize;
            //set font size

            var font_weight = object.getFontWeight();
            scope.editable.bold = (font_weight == 'bold' ? true : false);

            var font_style = object.getFontStyle();
            scope.editable.italic = (font_style == 'italic' ? true : false);

            scope.$apply();
        } else {
            scope.editMode = 'image';
            scope.$apply();
        }
        return;

    });
	
    //setup the app
    angular.module('app', ['ui.router', 'ui.bootstrap', 'ui.slider', 'rzModule', 'templatescache', 'simplecolorpicker', 'imgpreload', 'perfect_scrollbar', 'angularFileUpload', 'ngSanitize', 'LocalStorageModule', 'angularSpectrumColorpicker', 'ui.spinner', 'countrySelect', 'gettext']);
    angular.module('app').constant('_', window._);

	angular.module('app').run(function (gettextCatalog, ApiService) {
		gettextCatalog.loadRemote( ApiService.Url("get_language.php") );
	});

    angular.module('app').filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
                input.push(i);
            return input;
        };
    });
    
	//used for CORS (e.g. phonegap)
    angular.module('app').config(function ($httpProvider) {

        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;
        
        //Remove the header used to identify ajax call  that would prevent CORS from working
        delete $httpProvider.defaults.headers.common['X-Requested-With'];        
    });

})();
'use strict';

var topLeftImage = new Image();
topLeftImage.src = 'css/images/fa_times.png';

var topRightImage = new Image();
topRightImage.src = 'css/images/fa_rotate.png';

var bottomRightImage = new Image();
bottomRightImage.src = 'css/images/fa_resize.png';

var bottomLeftImage = new Image();
bottomLeftImage.src = 'css/images/fa_layers.png';

function isVML() {
    return typeof G_vmlCanvasManager !== 'undefined';
};

fabric.Object.prototype._drawControl = function(control, ctx, methodName, left, top) {
    var size = this.cornerSize;
    if (this.isControlVisible(control)) {
        isVML() || this.transparentCorners || ctx.clearRect(left, top, size, size);
        
        ctx.strokeStyle = 'rgba(102, 153, 255, 0.5)';  // some color/style
        ctx.lineWidth = 1;         // thickness
        if(control == 'tl') {
            ctx.drawImage(topLeftImage, left, top, size, size);  
            ctx.strokeRect(left, top, size, size);
        } else if(control == 'tr') {
            ctx.drawImage(topRightImage, left, top, size, size);
            ctx.strokeRect(left, top, size, size);
        } else if(control == 'bl') {
            ctx.drawImage(bottomLeftImage, left, top, size, size);
            ctx.strokeRect(left, top, size, size);
        } else if(control == 'br') {
            ctx.drawImage(bottomRightImage, left, top, size, size);
            ctx.strokeRect(left, top, size, size);
        } else {
            //ctx[methodName](left, top, size, size);
        }
    }
};

fabric.Canvas.prototype._getActionFromCorner = function(target, corner) {
    var action = 'drag';
    if (corner) {

        action = (corner === 'ml' || corner === 'mr')
        ? 'scaleX'
        : (corner === 'mt' || corner === 'mb')
        ? 'scaleY'
        : corner === 'tl'
        ? 'rotate'
        : 'scale';

        if(corner == 'tr')
            action = 'rotate';

        if(corner == 'tl') {
            action = 'delete';
            deleteObject();
        }
        
        if(corner == 'bl') {
            action = 'layer';
            showLayerChoice(target.top, target.left);
            
        }

    }

    return action;
};

fabric.Canvas.prototype._handleCursorAndEvent = function(e, target) {
    this._setCursorFromEvent(e, target);

    // TODO: why are we doing this?
    var _this = this;
    setTimeout(function () {
        _this._setCursorFromEvent(e, target);
    }, 50);

    this.fire('mouse:up', { target: target, e: e });
    target && target.fire('mouseup', { e: e });
};
fabric.Canvas.prototype._getRotatedCornerCursor =  function(corner, target) {
    var cursorOffset = {
        mt: 0, // n
        tr: 1, // ne
        mr: 2, // e
        br: 3, // se
        mb: 4, // s
        bl: 5, // sw
        ml: 6, // w
        tl: 7 // nw
    };

    if(corner == 'tr')
        return 'copy';          
    if(corner == 'tl')
        return 'pointer';    
    if(corner == 'bl')
        return 'pointer';    

    var n = Math.round((target.getAngle() % 360) / 45);

    if (n < 0) {
        n += 8; // full circle ahead
    }
    n += cursorOffset[corner];
    // normalize n to be from 0 to 7
    n %= 8;

    return this.cursorMap[n];
};


function showLayerChoice() {
    setTimeout(function(){
        $('#layer-choice').show();
    }, 300);    
}

function deleteObject() {
    $('#layer-choice').hide();
    $.confirm({
        text: "Are you sure you want to delete this item?",
        confirm: function() {
            var scope = angular.element(document.getElementById('designer-controller')).scope();
            scope.canvas.remove(scope.canvas.getActiveObject());
            scope.drawCanvas();
            scope.saveCanvas();
            scope.editableItem = null;
            if (scope.$root.$$phase !== '$apply' && scope.$root.$$phase !== '$digest') {
                scope.$apply();
            }
        },
        cancel: function() {
            // nothing to do
        }
    });
}

'use strict';

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
	
	$urlRouterProvider.otherwise('/home');

	$stateProvider
		.state('app',{
	      url: '',
	      views: {
	        '': {
	            templateUrl: 'viewer.html',
	            abstract: true
	        },      
	        'edit_text': {
				templateUrl: 'text.edit.html',
	            controller: 'TextEditController'
	        },
	        'edit_image':{
				templateUrl: 'images.edit.html',
				controller: 'ImagesEditController'
	        }
	      }
	    })
		// HOME STATES AND NESTED VIEWS ========================================
		.state('app.home', {
			url: '/home',
			templateUrl: 'home.html'
		})			
		// IMAGES STATES AND NESTED VIEWS ========================================
		.state('app.product', {
			url: '/product',
            abstract: true,
            templateUrl: 'viewer.html',
			controller: 'ProductController'
		})
        .state('app.product.home', {
			url: '/home',
			templateUrl: 'product.home.html',
		})	
        .state('app.product.selection', {
        	url: '/selection/:productSlug/:variantSlug',
			controller: 'ProductSelectionController'	
		})
        .state('app.product.browser', {
			url: '/browser',
            templateUrl: 'product.home.html',
            onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                $modal.open({
                    templateUrl: "product.browser.html",
                    backdrop: false,
                    size:'lg',
                    resolve: {
                    },
                    controller: 'ProductBrowserController'
                }).result.then(function(result) {
                    if (result) {
                        return $state.transitionTo("items");
                    }
                });
            }]
		})	
		// IMAGES STATES AND NESTED VIEWS ========================================
		.state('app.images', {
			url: '/images',
			abstract: true,
			templateUrl: 'image.html',
			controller: 'ImagesController'
		})
		.state('app.images.home', {
			url: '/home',
			templateUrl: 'images.home.html'
		})			
		.state('app.images.clip-art', {
			url: '/clip-art',
			templateUrl: 'images.clip-art.html',
            controller: 'ImagesGraphicsController'
		})		
		.state('app.images.add-graphic', {
			url: '/add-graphic/*path',
            controller: 'ImagesAddGraphicController'
		})
		.state('app.images.upload', {
			url: '/upload',
			templateUrl: 'images.upload.html',
            controller: 'ImagesUploadController'
		})
		.state('app.images.my-images', {
			url: '/my-images',
			templateUrl: 'images.my-images.html',
			controller: 'ImagesBoxController'
		})			
		.state('app.images.edit', {
			url: '/edit',
			templateUrl: 'images.edit.html',
			controller: 'ImagesEditController'
		})
		// TEXT STATES AND NESTED VIEWS ========================================
		.state('app.text', {
			url: '/text',
			abstract: true,
			templateUrl: 'viewer.html',
			controller: 'TextController'
		})
		.state('app.text.add', {
			url: '/add',
			templateUrl: 'text.add.html'
		})			
		.state('app.text.edit', {
			url: '/edit',
			templateUrl: 'text.edit.html',
            controller: 'TextEditController'
		})
		// BUY STATES AND NESTED VIEWS ========================================
		.state('app.buy', {
			url: '/buy',
            abstract: true,
            templateUrl: 'viewer.html',
			controller: 'BuyController'
		})
        .state('app.buy.home', {
			url: '/home',
			templateUrl: 'buy.home.html',
		});
		
});
/*
 jQuery UI Spinner plugin wrapper
*/
angular.module('ui.spinner', [])
        .value('uiSpinnerConfig',{})
        .directive('uiSpinner', ['uiSpinnerConfig', '$timeout', function(uiSpinnerConfig, $timeout) {
            
    uiSpinnerConfig = uiSpinnerConfig || {};
    return {
        require: 'ngModel',
        compile: function () {
            return function (scope, elm, attrs, ngModel) {

                function parseNumber(n, decimals) {
                    return (decimals) ? parseFloat(n) : parseInt(n);
                };

                var options = angular.extend(scope.$eval(attrs.uiSpinner) || {}, uiSpinnerConfig);
                // Object holding range values
                var prevRangeValues = {
                    min: null,
                    max: null
                };

                // convenience properties
                var properties = ['min', 'max', 'step', 'start', 'numberFormat', 'mouseWheel'];
                var useDecimals = (!angular.isUndefined(attrs.useDecimals)) ? true : false;

                var init = function() {

                    // Ensure the convenience properties are passed as options if they're defined
                    // This avoids init ordering issues where the spinner's initial state (eg handle
                    // position) is calculated using widget defaults
                    // Note the properties take precedence over any duplicates in options
                    angular.forEach(properties, function(property) {
                        if (angular.isDefined(attrs[property])) {
                            options[property] = parseNumber(attrs[property], useDecimals);
                        }
                    });
                    options['mouseWheel'] = false;

                    elm.spinner(options);
                    init = angular.noop;
                };

                // Find out if decimals are to be used for spinner
                angular.forEach(properties, function(property) {
                    // support {{}} and watch for updates
                    attrs.$observe(property, function(newVal) {
                        if (!!newVal) {
                            init();
                            elm.spinner('option', property, parseNumber(newVal, useDecimals));
                            ngModel.$render();
                        }
                    });
                });
                attrs.$observe('disabled', function(newVal) {
                    init();
                    elm.spinner('option', 'disabled', !!newVal);
                });

                // Watch ui-spinner (byVal) for changes and update
                scope.$watch(attrs.uiSpinner, function(newVal) {
                    init();
                    if(newVal != undefined) {
                      elm.spinner('option', newVal);
                    }
                }, true);

                // Late-bind to prevent compiler clobbering
                $timeout(init, 0, true);

                // Update model value from spinner
                elm.bind('spin', function(event, ui) {
                    ngModel.$setViewValue(ui.values || ui.value);
                    scope.$apply();
                });

                // Update spinner from model value
                ngModel.$render = function() {
                    init();
                    var method = options.range === true ? 'values' : 'value';
                    
                    if (!options.range && isNaN(ngModel.$viewValue) && !(ngModel.$viewValue instanceof Array)) {
                        ngModel.$viewValue = 0;
                    }
                    else if (options.range && !angular.isDefined(ngModel.$viewValue)) {
                            ngModel.$viewValue = [0,0];
                    }

                    // Do some sanity check of range values
                    if (options.range === true) {
                        
                        // Check outer bounds for min and max values
                        if (angular.isDefined(options.min) && options.min > ngModel.$viewValue[0]) {
                            ngModel.$viewValue[0] = options.min;
                        }
                        if (angular.isDefined(options.max) && options.max < ngModel.$viewValue[1]) {
                            ngModel.$viewValue[1] = options.max;
                        }

                        // Check min and max range values
                        if (ngModel.$viewValue[0] > ngModel.$viewValue[1]) {
                            // Min value should be less to equal to max value
                            if (prevRangeValues.min >= ngModel.$viewValue[1])
                                ngModel.$viewValue[0] = prevRangeValues.min;
                            // Max value should be less to equal to min value
                            if (prevRangeValues.max <= ngModel.$viewValue[0])
                                ngModel.$viewValue[1] = prevRangeValues.max;
                        }

                        // Store values for later user
                        prevRangeValues.min = ngModel.$viewValue[0];
                        prevRangeValues.max = ngModel.$viewValue[1];

                    }
                    elm.spinner(method, ngModel.$viewValue);
                };

                scope.$watch(attrs.ngModel, function() {
                    if (options.range === true) {
                        ngModel.$render();
                    }
                }, true);

                function destroy() {
                    elm.spinner('destroy');
                }
                elm.bind('$destroy', destroy);
            };
        }
    };
            
}]);

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
/**
 * The checkout screen + stripe integration
 */
angular.module('app').controller('BuyCheckoutController', function( $scope, $location, $urlRouter, $stateParams, $http, ApiService, PriceService, $state, CanvasService, ProductService, CartService, localStorageService, stripe_publishable_key, currency_code, settings, $modal, $modalInstance, $rootScope, $window, $q) {
	this.name = "BuyCheckoutController";
	this.params = $stateParams;
	$scope.totalPrice = 0;
	$scope.orderId = 0;
	$scope.zoom = 75/460;
	$scope.customer_details = {};
    $scope.checkout_details = {};
    $scope.settings = settings;
	$scope.selectedCountry = {};
    $scope.postageTypes = null;
    $scope.postageOption = 0;
	$scope.PriceService = PriceService;
    $scope.ProductService = ProductService;
    $scope.CartService = CartService;
	$scope.localStorageService = localStorageService;
    $scope.stripe_publishable_key = stripe_publishable_key;
    $scope.currency_code = currency_code;
    $scope.purchase = false;

    $scope.word = /^[a-z0-9\-\s]+$/i;
  $scope.countries = [ // Taken from https://gist.github.com/unceus/6501985
    {name: 'Afghanistan', code: 'AF'},
    {name: 'Åland Islands', code: 'AX'},
    {name: 'Albania', code: 'AL'},
    {name: 'Algeria', code: 'DZ'},
    {name: 'American Samoa', code: 'AS'},
    {name: 'Andorra', code: 'AD'},
    {name: 'Angola', code: 'AO'},
    {name: 'Anguilla', code: 'AI'},
    {name: 'Antarctica', code: 'AQ'},
    {name: 'Antigua and Barbuda', code: 'AG'},
    {name: 'Argentina', code: 'AR'},
    {name: 'Armenia', code: 'AM'},
    {name: 'Aruba', code: 'AW'},
    {name: 'Australia', code: 'AU'},
    {name: 'Austria', code: 'AT'},
    {name: 'Azerbaijan', code: 'AZ'},
    {name: 'Bahamas', code: 'BS'},
    {name: 'Bahrain', code: 'BH'},
    {name: 'Bangladesh', code: 'BD'},
    {name: 'Barbados', code: 'BB'},
    {name: 'Belarus', code: 'BY'},
    {name: 'Belgium', code: 'BE'},
    {name: 'Belize', code: 'BZ'},
    {name: 'Benin', code: 'BJ'},
    {name: 'Bermuda', code: 'BM'},
    {name: 'Bhutan', code: 'BT'},
    {name: 'Bolivia', code: 'BO'},
    {name: 'Bosnia and Herzegovina', code: 'BA'},
    {name: 'Botswana', code: 'BW'},
    {name: 'Bouvet Island', code: 'BV'},
    {name: 'Brazil', code: 'BR'},
    {name: 'British Indian Ocean Territory', code: 'IO'},
    {name: 'Brunei Darussalam', code: 'BN'},
    {name: 'Bulgaria', code: 'BG'},
    {name: 'Burkina Faso', code: 'BF'},
    {name: 'Burundi', code: 'BI'},
    {name: 'Cambodia', code: 'KH'},
    {name: 'Cameroon', code: 'CM'},
    {name: 'Canada', code: 'CA'},
    {name: 'Cape Verde', code: 'CV'},
    {name: 'Cayman Islands', code: 'KY'},
    {name: 'Central African Republic', code: 'CF'},
    {name: 'Chad', code: 'TD'},
    {name: 'Chile', code: 'CL'},
    {name: 'China', code: 'CN'},
    {name: 'Christmas Island', code: 'CX'},
    {name: 'Cocos (Keeling) Islands', code: 'CC'},
    {name: 'Colombia', code: 'CO'},
    {name: 'Comoros', code: 'KM'},
    {name: 'Congo', code: 'CG'},
    {name: 'Congo, The Democratic Republic of the', code: 'CD'},
    {name: 'Cook Islands', code: 'CK'},
    {name: 'Costa Rica', code: 'CR'},
    {name: 'Cote D\'Ivoire', code: 'CI'},
    {name: 'Croatia', code: 'HR'},
    {name: 'Cuba', code: 'CU'},
    {name: 'Cyprus', code: 'CY'},
    {name: 'Czech Republic', code: 'CZ'},
    {name: 'Denmark', code: 'DK'},
    {name: 'Djibouti', code: 'DJ'},
    {name: 'Dominica', code: 'DM'},
    {name: 'Dominican Republic', code: 'DO'},
    {name: 'Ecuador', code: 'EC'},
    {name: 'Egypt', code: 'EG'},
    {name: 'El Salvador', code: 'SV'},
    {name: 'Equatorial Guinea', code: 'GQ'},
    {name: 'Eritrea', code: 'ER'},
    {name: 'Estonia', code: 'EE'},
    {name: 'Ethiopia', code: 'ET'},
    {name: 'Falkland Islands (Malvinas)', code: 'FK'},
    {name: 'Faroe Islands', code: 'FO'},
    {name: 'Fiji', code: 'FJ'},
    {name: 'Finland', code: 'FI'},
    {name: 'France', code: 'FR'},
    {name: 'French Guiana', code: 'GF'},
    {name: 'French Polynesia', code: 'PF'},
    {name: 'French Southern Territories', code: 'TF'},
    {name: 'Gabon', code: 'GA'},
    {name: 'Gambia', code: 'GM'},
    {name: 'Georgia', code: 'GE'},
    {name: 'Germany', code: 'DE'},
    {name: 'Ghana', code: 'GH'},
    {name: 'Gibraltar', code: 'GI'},
    {name: 'Greece', code: 'GR'},
    {name: 'Greenland', code: 'GL'},
    {name: 'Grenada', code: 'GD'},
    {name: 'Guadeloupe', code: 'GP'},
    {name: 'Guam', code: 'GU'},
    {name: 'Guatemala', code: 'GT'},
    {name: 'Guernsey', code: 'GG'},
    {name: 'Guinea', code: 'GN'},
    {name: 'Guinea-Bissau', code: 'GW'},
    {name: 'Guyana', code: 'GY'},
    {name: 'Haiti', code: 'HT'},
    {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
    {name: 'Holy See (Vatican City State)', code: 'VA'},
    {name: 'Honduras', code: 'HN'},
    {name: 'Hong Kong', code: 'HK'},
    {name: 'Hungary', code: 'HU'},
    {name: 'Iceland', code: 'IS'},
    {name: 'India', code: 'IN'},
    {name: 'Indonesia', code: 'ID'},
    {name: 'Iran, Islamic Republic Of', code: 'IR'},
    {name: 'Iraq', code: 'IQ'},
    {name: 'Ireland', code: 'IE'},
    {name: 'Isle of Man', code: 'IM'},
    {name: 'Israel', code: 'IL'},
    {name: 'Italy', code: 'IT'},
    {name: 'Jamaica', code: 'JM'},
    {name: 'Japan', code: 'JP'},
    {name: 'Jersey', code: 'JE'},
    {name: 'Jordan', code: 'JO'},
    {name: 'Kazakhstan', code: 'KZ'},
    {name: 'Kenya', code: 'KE'},
    {name: 'Kiribati', code: 'KI'},
    {name: 'Korea, Democratic People\'s Republic of', code: 'KP'},
    {name: 'Korea, Republic of', code: 'KR'},
    {name: 'Kuwait', code: 'KW'},
    {name: 'Kyrgyzstan', code: 'KG'},
    {name: 'Lao People\'s Democratic Republic', code: 'LA'},
    {name: 'Latvia', code: 'LV'},
    {name: 'Lebanon', code: 'LB'},
    {name: 'Lesotho', code: 'LS'},
    {name: 'Liberia', code: 'LR'},
    {name: 'Libyan Arab Jamahiriya', code: 'LY'},
    {name: 'Liechtenstein', code: 'LI'},
    {name: 'Lithuania', code: 'LT'},
    {name: 'Luxembourg', code: 'LU'},
    {name: 'Macao', code: 'MO'},
    {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
    {name: 'Madagascar', code: 'MG'},
    {name: 'Malawi', code: 'MW'},
    {name: 'Malaysia', code: 'MY'},
    {name: 'Maldives', code: 'MV'},
    {name: 'Mali', code: 'ML'},
    {name: 'Malta', code: 'MT'},
    {name: 'Marshall Islands', code: 'MH'},
    {name: 'Martinique', code: 'MQ'},
    {name: 'Mauritania', code: 'MR'},
    {name: 'Mauritius', code: 'MU'},
    {name: 'Mayotte', code: 'YT'},
    {name: 'Mexico', code: 'MX'},
    {name: 'Micronesia, Federated States of', code: 'FM'},
    {name: 'Moldova, Republic of', code: 'MD'},
    {name: 'Monaco', code: 'MC'},
    {name: 'Mongolia', code: 'MN'},
    {name: 'Montserrat', code: 'MS'},
    {name: 'Morocco', code: 'MA'},
    {name: 'Mozambique', code: 'MZ'},
    {name: 'Myanmar', code: 'MM'},
    {name: 'Namibia', code: 'NA'},
    {name: 'Nauru', code: 'NR'},
    {name: 'Nepal', code: 'NP'},
    {name: 'Netherlands', code: 'NL'},
    {name: 'Netherlands Antilles', code: 'AN'},
    {name: 'New Caledonia', code: 'NC'},
    {name: 'New Zealand', code: 'NZ'},
    {name: 'Nicaragua', code: 'NI'},
    {name: 'Niger', code: 'NE'},
    {name: 'Nigeria', code: 'NG'},
    {name: 'Niue', code: 'NU'},
    {name: 'Norfolk Island', code: 'NF'},
    {name: 'Northern Mariana Islands', code: 'MP'},
    {name: 'Norway', code: 'NO'},
    {name: 'Oman', code: 'OM'},
    {name: 'Pakistan', code: 'PK'},
    {name: 'Palau', code: 'PW'},
    {name: 'Palestinian Territory, Occupied', code: 'PS'},
    {name: 'Panama', code: 'PA'},
    {name: 'Papua New Guinea', code: 'PG'},
    {name: 'Paraguay', code: 'PY'},
    {name: 'Peru', code: 'PE'},
    {name: 'Philippines', code: 'PH'},
    {name: 'Pitcairn', code: 'PN'},
    {name: 'Poland', code: 'PL'},
    {name: 'Portugal', code: 'PT'},
    {name: 'Puerto Rico', code: 'PR'},
    {name: 'Qatar', code: 'QA'},
    {name: 'Reunion', code: 'RE'},
    {name: 'Romania', code: 'RO'},
    {name: 'Russian Federation', code: 'RU'},
    {name: 'Rwanda', code: 'RW'},
    {name: 'Saint Helena', code: 'SH'},
    {name: 'Saint Kitts and Nevis', code: 'KN'},
    {name: 'Saint Lucia', code: 'LC'},
    {name: 'Saint Pierre and Miquelon', code: 'PM'},
    {name: 'Saint Vincent and the Grenadines', code: 'VC'},
    {name: 'Samoa', code: 'WS'},
    {name: 'San Marino', code: 'SM'},
    {name: 'Sao Tome and Principe', code: 'ST'},
    {name: 'Saudi Arabia', code: 'SA'},
    {name: 'Senegal', code: 'SN'},
    {name: 'Serbia and Montenegro', code: 'CS'},
    {name: 'Seychelles', code: 'SC'},
    {name: 'Sierra Leone', code: 'SL'},
    {name: 'Singapore', code: 'SG'},
    {name: 'Slovakia', code: 'SK'},
    {name: 'Slovenia', code: 'SI'},
    {name: 'Solomon Islands', code: 'SB'},
    {name: 'Somalia', code: 'SO'},
    {name: 'South Africa', code: 'ZA'},
    {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
    {name: 'Spain', code: 'ES'},
    {name: 'Sri Lanka', code: 'LK'},
    {name: 'Sudan', code: 'SD'},
    {name: 'Suriname', code: 'SR'},
    {name: 'Svalbard and Jan Mayen', code: 'SJ'},
    {name: 'Swaziland', code: 'SZ'},
    {name: 'Sweden', code: 'SE'},
    {name: 'Switzerland', code: 'CH'},
    {name: 'Syrian Arab Republic', code: 'SY'},
    {name: 'Taiwan, Province of China', code: 'TW'},
    {name: 'Tajikistan', code: 'TJ'},
    {name: 'Tanzania, United Republic of', code: 'TZ'},
    {name: 'Thailand', code: 'TH'},
    {name: 'Timor-Leste', code: 'TL'},
    {name: 'Togo', code: 'TG'},
    {name: 'Tokelau', code: 'TK'},
    {name: 'Tonga', code: 'TO'},
    {name: 'Trinidad and Tobago', code: 'TT'},
    {name: 'Tunisia', code: 'TN'},
    {name: 'Turkey', code: 'TR'},
    {name: 'Turkmenistan', code: 'TM'},
    {name: 'Turks and Caicos Islands', code: 'TC'},
    {name: 'Tuvalu', code: 'TV'},
    {name: 'Uganda', code: 'UG'},
    {name: 'Ukraine', code: 'UA'},
    {name: 'United Arab Emirates', code: 'AE'},
    {name: 'United Kingdom', code: 'GB'},
    {name: 'United States', code: 'US'},
    {name: 'United States Minor Outlying Islands', code: 'UM'},
    {name: 'Uruguay', code: 'UY'},
    {name: 'Uzbekistan', code: 'UZ'},
    {name: 'Vanuatu', code: 'VU'},
    {name: 'Venezuela', code: 'VE'},
    {name: 'Vietnam', code: 'VN'},
    {name: 'Virgin Islands, British', code: 'VG'},
    {name: 'Virgin Islands, U.S.', code: 'VI'},
    {name: 'Wallis and Futuna', code: 'WF'},
    {name: 'Western Sahara', code: 'EH'},
    {name: 'Yemen', code: 'YE'},
    {name: 'Zambia', code: 'ZM'},
    {name: 'Zimbabwe', code: 'ZW'}
  ];

    window.scope = $scope;
	window.scopeCheckout = $scope;

    $scope.$watchCollection('customer_details', function(newValue, oldValue) {
        var customer_details = localStorageService.set('customer_details', $scope.customer_details);
    });

    $scope.$watch('postageOption', function(newValue, oldValue) {
        PriceService.setPostage(newValue); //remember choice for next time
        $scope.postageOption = newValue;
    });
      
    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };
    
    $scope.getCheckoutDetails = function() {
        
        var items = CartService.getItems();
        $scope.totalPrice = CartService.getTotalPrice();
        
        $scope.checkout_details['title'] = items.length + " items";        
        $scope.checkout_details['quantity'] = items.length;

        $scope.checkout_details['price'] = accounting.formatMoney(CartService.sumTotalPrice(), PriceService.getCurrencySymbol());
        $scope.checkout_details['amount'] = $scope.totalPrice;
        $scope.checkout_details['description'] = items.length + " items";
        $scope.checkout_details['postage'] = PriceService.getPostage();        
        $scope.checkout_details['currency'] = PriceService.getCurrency();
        $scope.checkout_details['postage_description'] = PriceService.getPostageDescription();
        $scope.checkout_details['items'] = items;
        
        console.log('checkout_details', $scope.checkout_details);
    };
    
    $scope.calcTotalPrice = function(){
        var price = accounting.unformat($scope.checkout_details.price);
        if($scope.postageTypes != null) {
            price += accounting.unformat($scope.postageTypes[$scope.postageOption].price);
        }
        return $scope.formatMoney(price);
    };

    $scope.sumQuantities = function(quantities){
        var quantity =  _.reduce(quantities, function(memo, num){
                            num = parseInt(num);
                            return memo + num;
                        }, 0);
        return quantity;
    };

    $scope.formatMoney = function(price) {
        return accounting.formatMoney(price, PriceService.getCurrencySymbol());
    };

    $scope.dismiss = function() {
        $scope.$dismiss();
    };
    
    $scope.calcLeft = function(width, offsetWidth) {
        return (-width/2) + (offsetWidth/2);
    };
    
    $scope.handlePaypalToken = function(token) {
        show_indicator();
        $http({method: 'POST', url: ApiService.Url("paypal/checkout_confirm.php"), data: {token:token, orderId:$scope.orderId}, cache: false}).
            success(function(data, status, headers, config) {
                $scope.order = data;

                $modalInstance.close(true);
                hide_indicator();
                
                //Thank you for your order
                var modalInstance = $modal.open({
                  templateUrl: 'buy.confirmation.html',
                  controller: 'BuyConfirmationController',
                  backdrop: true,
                  size: 'lg',
                  resolve: {
                    order: function () {
                        return $scope.order;
                    }
                  }
                });

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.handleConfirmation = function(params) {
        //Thank you for your order
        show_indicator();
        $http({method: 'POST', url: ApiService.Url("checkout.php"), data: params, cache: false}).
            success(function(data, status, headers, config) {
                $scope.order = data;

                $modalInstance.close(true);
                hide_indicator();
                
                //Thank you for your order
                var modalInstance = $modal.open({
                  templateUrl: 'buy.confirmation.html',
                  controller: 'BuyConfirmationController',
                  backdrop: true,
                  size: 'lg',
                  resolve: {
                    order: function () {
                        return $scope.order;
                    }
                  }
                });

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.handleCustomPayment = function(orderId) {
        var params = {};
        params.orderId = orderId;
        $scope.handleConfirmation(params);
    };

    $scope.handleStripeToken = function(token, args) {
        var params = {};
        params.token = token;
        params.args = args;
        params.orderId = $scope.orderId;
        $scope.handleConfirmation(params);
    };
        
    $scope.saving = false;
    $scope.selectedMethod = null;
    $scope.showMethodChoices = function() {
        
        var modalInstance = $modal.open({
          templateUrl: 'buy.payment-method.html',
          controller: 'BuyPaymentMethodController',
          backdrop: true,
          size: 'md',
          resolve: {
            paymentMethods: function () {
                return $scope.settings.paymentMethods;
            }
          }
        });

        modalInstance.result.then(function (selectedMethod) {
            $scope.selectedMethod = selectedMethod;
            $scope.startPayment();
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });

    };

    // function to submit the form after all validation has occurred            
    $scope.submitForm = function(isValid) {
        console.log('isValid', isValid);
        // check to make sure the form is completely valid
        if (isValid) {
            //save form
            if( _.size($scope.settings.paymentMethods) > 1 ) {
                $scope.showMethodChoices();
            } else {
                $scope.startPayment();
            }
            //$scope.payWithStripe();
        }

    };
    
    $scope.preCheckout = function() {
        var deferred = $q.defer();

        //save customer details
        var params = {};
        params['customer_details'] = $scope.customer_details;
        params['amount'] =  CartService.getTotalPrice();
        params['cart'] =  CartService.getItems();
        params['checkout_details'] =  $scope.checkout_details;
        params['postage'] =  PriceService.getPostage();
        params['payment_method'] = $scope.selectedMethod;
        console.log('postage', params['amount'], params['postage'], $scope.postageOption);
        $scope.saving = true;

        $http({method: 'POST', url: ApiService.Url("checkout_pre.php"), data: params, cache: false}).
            success(function(data, status, headers, config) {
                $scope.orderId = data.order.id;
                $scope.saving = false;
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                $scope.saving = false;
                deferred.reject(data);
            });
        return deferred.promise;
    };

    $scope.startPayment = function() {

        //only stripe and bank transfer are integrated 
        if( $scope.selectedMethod != 'stripe' && $scope.selectedMethod != 'bank_transfer') {
            openCustomWindow(ApiService.Url("processors/please_wait.html"));
        }

        //out-of-the-box others are custom methods
        $scope.preCheckout().then(function(data) {
            //console.log('startPayment', data.order.payment_method);

            if( data.order.payment_method == 'stripe' ) {
                // Open Checkout with further options
                $scope.stripeHandler.open({
                    email: $scope.customer_details.email,
                    name: $scope.site_name,
                    description: $scope.checkout_details['title'],
                    amount: accounting.toFixed(data.order.amount*100),
                    currency: PriceService.getCurrency()
                });
            } else if( data.order.payment_method == 'bank_transfer' ) {
                //bank transfer      
                var params = {};
                params.orderId = $scope.orderId;
                $scope.handleConfirmation(params);
            } else {
                
                //Unfortunately paypal has to open in a new window for now :(
                var customUrl = ApiService.Url("processors/" + data.order.payment_method + "/start.php?id=" + $scope.orderId);
                var customInfo = $scope.getPaymentMethodInfo(data.order.payment_method);

                if (customWindow && !customWindow.closed) {
                    customWindow.focus();
                    customWindow.location.href = customUrl;
                    /*if($scope.settings.paypal_environment == 'sandbox') {
                        paypalUrl = "https://www.sandbox.paypal.com";
                    }
                    customWindow.location.href = paypalUrl + "/cgi-bin/webscr?cmd=_express-checkout&force_sa=true&token="+ data.order.token;*/
                } else {
                    var modalInstance = $modal.open({
                        scope: $scope,
                        templateUrl: 'buy.custom.html',
                        controller: 'BuyCustomController',
                        backdrop: true,
                        size: 'sm',
                        resolve: {
                            title: function () {
                                return customInfo.name;
                            },
                            customUrl: function () {
                                return customUrl;
                            }
                        }
                    });
                }


            }

        });

    };

    $scope.stripeHandler = null;
    $scope.init = function() {

        $scope.postageOption = PriceService.getPostage();

        $scope.customer_details.country = _.find($scope.countries, {'code':'GB'});

        var customer_details = localStorageService.get('customer_details');
        if(customer_details != null) {
            $scope.customer_details = customer_details;
            console.log($scope.customer_details.country);
            if(!angular.isUndefined($scope.customer_details.country.code)) {
                $scope.customer_details.country = _.find($scope.countries, {'code':$scope.customer_details.country.code});
            }
        }

        //load pricing
        $http({method: 'GET', url: ApiService.Url("get_pricing.php"), cache: false}).
        success(function(data, status, headers, config) {
            $scope.pricing = data.pricing;
            $scope.postageTypes = data.delivery_types;
            console.log(data);
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        
        $scope.selectedMethod = _.first($scope.settings.paymentMethods).slug;
        //console.log($scope.settings);

        //init stripe
        if(_.indexOf(_.pluck($scope.settings.paymentMethods, 'slug'), 'stripe') > -1) {
            var stripeInfo = $scope.getPaymentMethodInfo('stripe');
            $scope.stripeHandler = StripeCheckout.configure({
                key: stripeInfo.publishable_key,
                image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
                token: function(token, args) {
                    // Use the token to create the charge with a server-side script.
                    // You can access the token ID with `token.id`
                    $scope.handleStripeToken(token, args);
                }
            });
        }
        
        $scope.getCheckoutDetails();
	};  

    $scope.getPaymentMethodInfo = function(methodName) {
        return _.findWhere(scopeCheckout.settings.paymentMethods, {slug:methodName});
    };

    $scope.init();
    
});

function stripeResponseHandler(status, response) {
    console.log('stripeResponseHandler', status, response);
}

var customWindow;
function openCustomWindow(url) {
    var w = 1024;
    var h = 768;
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);

    if (typeof (customWindow) == 'undefined' || customWindow.closed) {
        customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
        customWindow.focus();
    } else {
        if (typeof (customWindow) == 'undefined' || customWindow.closed) {
            //create new, since none is open
            customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
        }
        else {
            try {
                customWindow.document; //if this throws an exception then we have no access to the child window - probably domain change so we open a new window
            }
            catch (e) {
                customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
                customWindow.focus();
            }

            //IE doesn't allow focus, so I close it and open a new one
            if (navigator.appName == 'Microsoft Internet Explorer') {
                customWindow.close();
                customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
                customWindow.focus();
            }
            else {
                //give it focus for a better user experience
                customWindow.focus();
            }
        }
    }
}
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
/**
 * Just before checkout
 */
angular.module('app').controller('BuyController', function( $scope, $location, $urlRouter, $stateParams, localStorageService, $http, ApiService, PriceService, $modal, CanvasService, CartService ) {
	this.name = "BuyController";
	this.params = $stateParams;
	$scope.quantities = {};
	$scope.pricing = {};
	$scope.sizeRows = 0;
	$scope.deliveryTypes = {};
	$scope.postageOption = 0;
    $scope.CanvasService = CanvasService;
	$scope.CartService = CartService;
    $scope.setActiveTab('buy');
	window.scope = $scope;
    
    $scope.reCalculatePrice = function() {
       $scope.totalPrice = CartService.sumTotalPrice();
    };
    
    $scope.addToCart = function() {

        var item = {};
        item.id = CartService.cartId;
        item.quantities = $scope.quantities;
        item.price = $scope.calculateSinglePrice();
        item.name = $scope.currentItem.product.name;
        item.thumb = 1;
        item.meta = {};
        CartService.insert(item);
        $scope.openCart();
	};
    
    //Quantities have changed
    //canvas has changed
    $scope.$watchCollection('quantities', function(newValue, oldValue) {
        $scope.storeQuantities();
    });
    
    $scope.screenPrint = function() {
        
        if(!$scope.isReady) {
            return "";
        }
        var str = "";
        _.each($scope.layers.orientations_layers, function(layer) {
            if(_.size( layer.fills) > 0) {
                str += _.size( layer.fills) + " color " + layer.name.toLowerCase();
                str += ", ";
            }
        });
        str = str.substring(0, str.length - 2);
        if($scope.isReady) {
            PriceService.setDescription(str);
            PriceService.setTitle($scope.currentItem.product.name);
        }
        return str;
    };
    
    $scope.sumQuantities = function(quantities) {
        var quantity =  _.reduce(quantities, function(memo, num){
                            num = parseInt(num);
                            return memo + num;
                        }, 0);
        return quantity;
    };
    
    $scope.sumPrice = function(quantities, price) {
        var quantity = $scope.sumQuantities(quantities);
        price = accounting.unformat(price);
        var price = price * quantity;
        return accounting.formatMoney(price, PriceService.getCurrencySymbol());
    };    

    $scope.formatMoney = function(price) {    
        return accounting.formatMoney(price, $scope.currency);
    }
    $scope.storeQuantities = function() {  
        PriceService.setQuantities($scope.quantities);
	};
    
    $scope.preInit = function() {
       $scope.quantities = PriceService.getQuantities();

    };
    
    $scope.init = function() {
        $scope.postageOption = PriceService.getPostage();
        $scope.quantities = PriceService.getQuantities();
        
        //load pricing
        $http({method: 'GET', url: ApiService.Url("get_pricing.php"), cache: false}).
            success(function(data, status, headers, config) {
                $scope.pricing = data.pricing;
                $scope.deliveryTypes = data.delivery_types;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        
        var quantities = PriceService.getQuantities();        
        $scope.sizeRows = Math.ceil ( 12 / _.size($scope.currentItem.product.sizes) );
        if($scope.isMobile) {
            $scope.sizeRows = Math.ceil ( 24 / _.size($scope.currentItem.product.sizes) );
        }
        
        _.each($scope.currentItem.product.sizes, function(size) {
            if(quantities && !angular.isUndefined(quantities[size])) {
                $scope.quantities[size] = quantities[size];
            } else {
                $scope.quantities[size] = 0;
            }
        });
        
	};
    
    $scope.openCheckout = function () {
        $scope.openCart();
    };
        
    $scope.$watch('isReady', function(newValue, oldValue) {
        if($scope.isReady) {
            $scope.init();        
        }
    });
    $scope.preInit();      
	
    
});
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
/**
 * Manages the cart
 */
angular.module('app').controller('CartController', function( $scope, $rootScope, $location, $http, PriceService, $state, ProductService, CartService, ApiService, $modal) {
	this.name = "CartController";

    window.cart_scope = $scope;
    window.cart_root = $rootScope;
    //$scope.items = [];
    $scope.images = {}
    $scope.CartService = CartService;
    $scope.money = PriceService;
    $scope.thumbWidth = 75;
    $scope.zoom = $scope.thumbWidth/460;
    $scope.justAdded = false;

    /*$scope.$watch('items', function (newVal) {
        $scope.reCalculatePrice();
    }, true);*/

    //Product has changed
    $scope.$watch('currentItem', function(newValue, oldValue) {
        $scope.init();
    });

    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };
    
    $scope.imageDims = function(dims) {
        
        var ratio = $scope.thumbWidth/dims.width;

        var selectedOrientationDimensions = {};
        selectedOrientationDimensions.width = ratio * dims.width;
        selectedOrientationDimensions.height = ratio * dims.height;
        selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
        selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
        selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
        selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;

        return selectedOrientationDimensions;

    }; 

    $scope.sumQuantities = function(quantities) {
        return CartService.sumQuantities(quantities);
    };
    
    $scope.sumPrice = function(quantities, price) {
        return CartService.sumPrice(quantities, price);
    };    

    $scope.reCalculatePrice = function() {
       $scope.setTotalPrice(CartService.sumTotalPrice());
       //$scope.totalPrice = CartService.sumTotalPrice();
    };
    
    $scope.addNewItem = function() {
        //alert(CartService.getItems().length);
        ProductService.getProducts().then(function(data) {
            
            
            var category = _.first(data.categories);
            var product = _.find(data.products, {slug: $scope.default_product});
            if(angular.isUndefined(product)) {
                product = _.find(data.products, {category: category.name});
            }

            var variant = _.find(product.variants, {slug: product.defaultVariant});
            if(angular.isUndefined(variant)) {
                variant = _.first(product.variants);
            }
            /*
            var category = _.first(data.categories);
            var product = _.find(data.products, {category: category.name});
            var variant = _.first(product.variants);
            */
            var newItem = CartService.newItem(product, variant);
            CartService.setSelectedItem(newItem.id);
            $scope.items = CartService.getItems();
            $scope.dismiss();
            $state.go('app.product.home');
            
        });

    };	

    $scope.duplicateItem = function(item) {

        var newItem = CartService.duplicateItem(item);
        CartService.setSelectedItem(newItem.id);
        $state.go('app.product.home');

    };

    $scope.removeItem = function(itemId) {

        CartService.remove(itemId);

        if(CartService.getItems().length == 0) {
            $scope.addNewItem();
        }
        $scope.items = CartService.getItems();
        $scope.reCalculatePrice();

    };    

    $scope.switchCurrentItem = function(itemId) {
        CartService.setSelectedItem(itemId);
    };

    
    $scope.dismiss = function() {

		if($('.cartModal').hasClass('in')) {
            $scope.$dismiss();
        }
        $('#cart').removeClass('active');
        
    };

    $scope.goToCheckout = function() {
        
        $scope.dismiss();
        console.log('$scope.settings', $scope.settings);
        var modalInstance = $modal.open({
          templateUrl: 'buy.checkout.html',
          controller: 'BuyCheckoutController',
          size: 'lg',
          resolve: {
            stripe_publishable_key: function () {
                return $scope.stripe_publishable_key;
            },
            currency_code: function () {
                return PriceService.getCurrency();
            },
            settings: function () {
                return $scope.settings;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.resetCart(); //clear the cart
        }, function () {
            console.log("CLOSED");
        });

    };

    $scope.init = function() {
        $scope.items = CartService.getItems();
        $scope.reCalculatePrice();
		$('[data-toggle="tooltip"]').tooltip({'placement': 'top'}); //the cart tooltip
	};

    $scope.init();
    
});
angular.module('app').controller('DesignerController', function($rootScope, $stateParams, $location, $scope, $state, $http, ApiService, ProductService, CanvasService, CartService, $modal, localStorageService, PriceService, FontService, gettextCatalog) {
    this.$state = $state;
    this.$location = $location;

    //canvas properties
    $scope.canvas = null;
    $scope.designerWidth = 460;
    $scope.designerHeight = 460;
    $scope.borderColor = "#000000";   
    $scope.zoom = 1;
    $scope.loaded = 0;  
    $scope.activeTab = 'home';
    $scope.editMode = 'none';
    $scope.defaultFont = 'Alpha Echo';

    //settings
    $scope.site_name = 'PrintPixel';
    $scope.currency_code = 'USD';
    $scope.currency = '$';
    //$scope.stripe_publishable_key = '';
    $scope.settings = {};

    $scope.editableItem = null;
    $scope.editableObject = null;
    $scope.editable = {};
    $scope.currentItem = null;
    $scope.selectedOrientation = ProductService.getOrientation();
    $scope.selectedOrientationDimensions = {};
    $scope.selectedProductOrientations = {};

    $scope.layers = {};   
    $scope.isReady = false; //only ready when products loaded, categories loaded, dom-ready, localstoreage ready
    $scope.totalPrice = 0;
    
    //for debugging
    window.scope = $scope;
    $scope.items = [];
    $scope.money = PriceService;
    $scope.CartService = CartService;
    $scope.CanvasService = CanvasService;
    $scope.ProductService = ProductService;
    $scope.localStorageService = localStorageService;
    $scope.mobileDesignerHidden = false;
    $scope.isMobile = (window.innerWidth <= 480 ? true : false);
    $scope.screenWidth = window.innerWidth;
    $scope.designerLeft = 0;

    $(window).resize(function(){
        $scope.$apply(function(){
            $scope.setViewData();
        });
    });
    $scope.$watch('isReady', function(newValue, oldValue) {
        $scope.setViewData();
    });

    $scope.$watch('items', function (newVal) {
        $scope.totalPrice = CartService.sumTotalPrice();
    }, true);

    $scope.$on('$stateChangeStart', function(e, next, current) { 

        $scope.editMode = 'none';
        var mobileRoutes = ["app.images.home", "app.text.add", "app.images.clip-art", "app.images.upload", "app.images.my-images", "app.images.edit", "app.buy.home"];

        if(_.indexOf(mobileRoutes, next.name) > -1) {
            $scope.hideMobileDesigner();
        } else {
            $scope.showMobileDesigner();
        }

    });
    $scope.$on('$stateChangeSuccess', function(e, next, current) {         
        if(next.url == '') {
            $state.go('app.home');
        }
    });

    $scope.uuid = null;
    $scope.setActiveTab = function(tab) {
        $scope.activeTab = tab;
    };   
    
    $scope.showMobileFooter = true;
    $scope.toggleMobileFooter = function() {
        if($scope.showMobileFooter) {
            $scope.showMobileFooter = false;
        } else {
            $scope.showMobileFooter = true;
        }
    };

    $scope.setViewData = function() {
        $scope.screenWidth = window.innerWidth;
        if(window.innerWidth <= 480) {
            $scope.isMobile = true;
            $scope.designerLeft = -($scope.designerWidth - $scope.screenWidth)/2;
        } else {
            $scope.isMobile = false;
            $scope.designerLeft = 0;
        }
    };    
    $scope.hideMobileDesigner = function() {
        $scope.mobileDesignerHidden = true;
    };
    $scope.showMobileDesigner = function() {
        $scope.mobileDesignerHidden = false;
    };

    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };
    
    $scope.imageTransparentUrl = function(data) {
        return ApiService.imageTransparentUrl(data);
    };
    
    $scope.calcLeft = function(width, offsetWidth) {
        return (-width/2) + (offsetWidth/2);
    };

    //the zoom functions
    $scope.zoomOut = function() {
        $scope.zoom = $scope.zoom - 0.1
        if($scope.zoom <= 1) {
            $scope.zoom = 1; 
        }
        $scope.canvas.setZoom($scope.zoom);
        $scope.drawCanvas();
        $scope.zoomCanvas();
    };
    
    $scope.zoomIn = function() {
        $scope.zoom = $scope.zoom + 0.1
        if($scope.zoom >= 2) {
            $scope.zoom = 2; 
        }
        $scope.zoomCanvas();
    };
    
    $scope.zoomCanvas = function() {
      
        var width = $scope.zoom * $scope.selectedOrientationDimensions.printableWidth;
        var height = $scope.zoom * $scope.selectedOrientationDimensions.printableHeight;
        var scale = width / $scope.canvas.getWidth();
        height = scale * $scope.canvas.getHeight();

        $scope.canvas.setDimensions({
            "width": width,
            "height": height
        });

        $scope.canvas.calcOffset();
        $scope.canvas.setZoom($scope.zoom);
        $scope.drawCanvas();
        if($scope.zoom == 1) {
            $('#designer-product').draggable( "disable" );
        } else {
            $('#designer-product').draggable( "enable" );
        }

    }
    
    //Product has changed
    $scope.$watch(function(){
        return CartService.selectedItemId;
    }, function (newValue) {
        if($scope.isReady) {
            
            $scope.canvas.clear();
            //this means we gotta update the canvas size
            $scope.currentItem = CartService.getSelectedItem();
            $scope.items = CartService.getItems();
            $scope.setOrientation(_.findKey($scope.currentItem.variant.orientations));

        }
    }, true);

    //Orientation has changed
    $scope.$watch(function(){
        return ProductService.currentOrientation;
    }, function (newValue) {
        if($scope.isReady) {

            $scope.canvas.clear();

            $scope.selectedOrientation = ProductService.getOrientation();
            $scope.updateOrientation();
        }

    }, true);

    //this handles the editable area switching
    $scope.updateOrientation = function() {

        //return false;
        $scope.zoom = 1; 
        var dims = _.find($scope.currentItem.product.orientations, {name:$scope.selectedOrientation});

        if(dims) {
            //$scope.designerWidth = dims.width;
            //$scope.designerHeight = dims.height;
            var ratio = $scope.designerWidth/dims.width;

			$scope.selectedOrientationDimensions.width = ratio * dims.width;
            $scope.selectedOrientationDimensions.height = ratio * dims.height;
            $scope.selectedOrientationDimensions.printableWidth = ratio * dims.printable_width;
            $scope.selectedOrientationDimensions.printableHeight = ratio * dims.printable_height;
            $scope.selectedOrientationDimensions.printableOffsetX = ratio * dims.printable_offset_x;
            $scope.selectedOrientationDimensions.printableOffsetY = ratio * dims.printable_offset_y;

            var prevWidth = $scope.canvas.getWidth();
            var prevHeight = $scope.canvas.getHeight();

            $scope.canvas.setWidth($scope.selectedOrientationDimensions.printableWidth);
            $scope.canvas.setHeight($scope.selectedOrientationDimensions.printableHeight);

            $scope.drawCanvas();
        }

        //fetch the canvas
        var orientationCanvas = null;
        if(angular.isUndefined($scope.currentItem.canvases[$scope.selectedOrientation])) {
            orientationCanvas = $scope.canvas;
        } else {
            
            // parse the data into the canvas
            orientationCanvas = $scope.currentItem.canvases[$scope.selectedOrientation];
            $scope.canvas.loadFromJSON(orientationCanvas);

            //reset zoom
            $scope.zoom = 1;
            $scope.zoomCanvas();

            // re-render the canvas
            $scope.drawCanvas();
        }
        //$scope.layers = $scope.calculateLayers();

        //set the control colors
        $scope.borderColor = getBorderColor(_.first($scope.currentItem.variant.colors));
		$('#designer-container').data('border',  $scope.borderColor);

		$('#designer-container').on({
			mouseenter: function () {
				$('#designer-container').css('border-color', $('#designer-container').data('border'));
			},
			mouseleave: function () {
				$('#designer-container').css('border-color', 'transparent');
			}
		});

    };

    $scope.setTotalPrice = function(totalPrice) {
        $scope.totalPrice = totalPrice;
    };
    
    $scope.saveCanvas = function() {
        CartService.updateItemCanvas($scope.selectedOrientation, $scope.canvas, CartService.selectedItemId);
    };

    $scope.setStackPosition = function(command) {
        var object = canvas.getActiveObject();
        if(object == null) {
            return;
        }
        
        if(command == 'bringToFront') {
            object.bringToFront();
            //$scope.canvas.item($scope.editableItem).bringToFront();
        }        

        if(command == 'sendBackwards') {
            object.sendBackwards();
            //$scope.canvas.item($scope.editableItem).sendBackwards();
        }        

        if(command == 'bringForward') {
            object.bringForward();
            //$scope.canvas.item($scope.editableItem).bringForward();
        }        

        if(command == 'sendToBack') {
            object.sendToBack();
            //$scope.canvas.item($scope.editableItem).sendToBack();
        }
        //canvas.renderAll();
        //$scope.drawCanvas();
        $scope.canvas = canvas;
        $scope.saveCanvas();
    }
    
    $scope.storeOrientation = function(orientation) {
        CanvasService.setOrientationDesign($scope.selectedOrientation, $scope.canvas);
        CartService.updateItemCanvas($scope.selectedOrientation, $scope.canvas, CartService.selectedItemId);
    }
    
    //this handles the canvas switching
    $scope.setOrientation = function(orientation) {
        
        ProductService.setOrientation(orientation);
        $scope.selectedOrientation = orientation;

        //fetch the canvas
        var orientationCanvas = null;
        if(angular.isUndefined($scope.currentItem.canvases[$scope.selectedOrientation])) {
            orientationCanvas = $scope.canvas;
        } else {
            
            // parse the data into the canvas
            orientationCanvas = $scope.currentItem.canvases[$scope.selectedOrientation];
            // parse the data into the canvas
            orientationCanvas = $scope.currentItem.canvases[$scope.selectedOrientation];
            $scope.canvas.loadFromJSON(orientationCanvas);

            //reset zoom
            $scope.zoom = 1;
            $scope.zoomCanvas();

            // re-render the canvas
            $scope.drawCanvas();
        }

    };
    
    $scope.fetchSession = function() {
        $http({method: 'GET', url: ApiService.Url("session.php"), cache: false}).
        success(function(data, status, headers, config) {
            $scope.uuid = data.uuid;
            if($scope.loaded < 100) {
               $scope.loaded = 60; 
            }
        }).
        error(function(data, status, headers, config) {

        });
    }

    $scope.changeState = function(value) {
        $state.go(value);
    }

    $scope.updateLocalStorage = function() {
        if($scope.canvas.getObjects().length > 0) { //only set orientation if we have at least 1 element
            $scope.storeOrientation($scope.selectedOrientation);
        } 
    }
    $scope.drawCanvas = function() {
        $scope.updateLocalStorage();
        canvas = $scope.canvas;
        canvas.renderAll();
        //canvas.calculateOffset();
    };

    $scope.resetCart = function() {
        CartService.reset(); //remove all cart items
        $scope.initCart();
    };

    $scope.initCart = function(value) {
        //fetch the last edited item in the cart
        $scope.currentItem = CartService.getSelectedItem();
        $scope.items = CartService.getItems();

        //do any of the cart products need to be removed?
        _.each($scope.items, function(item) {

            //does the product exist
            var product = _.find(productData.products, {slug: item.product.slug});
            if(angular.isUndefined(product)) {
                CartService.remove(item.id);
            }

            //does the variant exist?
           if(!angular.isUndefined(product)) {
                var variant = _.find(product.variants, {slug: item.variant.slug});
                if(angular.isUndefined(variant)) {
                    CartService.remove(item.id);
                }
            }

        });
        
        $scope.items = CartService.getItems();
        
        if($scope.items.length == 0) {

            var category = _.first(productData.categories);
            var product = _.find(productData.products, {slug: $scope.default_product});
            if(angular.isUndefined(product)) {
                product = _.find(productData.products, {category: category.name});
            }

            var variant = _.find(product.variants, {slug: product.defaultVariant});
            if(angular.isUndefined(variant)) {
                variant = _.first(product.variants);
            }
            
            CartService.newItem(product, variant);
            $scope.currentItem = CartService.getSelectedItem();
        }
        
        ProductService.setOrientation(_.findKey($scope.currentItem.variant.orientations));
    };

    $scope.init = function(value) {

        $scope.loaded = 30;

        //get products
        ProductService.getProducts().then(function(productData) {
            window.productData = productData;
            //set default items
            $scope.site_name = productData.settings.site_name;
            $scope.currency_code = productData.settings.currency;
            //$scope.stripe_publishable_key = productData.settings.stripe_publishable_key;
            $scope.currency = productData.settings.currency_symbol;
            $scope.default_product = productData.settings.default_product;
            $scope.settings = productData.settings;
            $scope.settings.paymentMethods = productData.payment_methods;

            gettextCatalog.setCurrentLanguage($scope.settings.language);

            PriceService.setCurrency(productData.settings.currency);
            PriceService.setCurrencySymbol(productData.settings.currency_symbol);

            $scope.loaded = 50;

            //gotta get the pricing
            FontService.getFonts().then(function(data) {
                $scope.loaded = 75;

                PriceService.getPricing().then(function(data) {
					
                    $scope.loaded = 100;
                    $scope.isReady = true;
                        
                    $scope.initCart();                    

                    //load actual fonts
                    FontService.preloadFonts().then(function() {
                    
                    });

                });
            });

        });
        

        
        $scope.canvas = canvas;
        $scope.fetchSession();

    };

    $scope.init();


    
    $scope.openCart = function() {
        var modalInstance = $modal.open({
          templateUrl: 'cart.html',
          controller: 'CartController',
          windowClass: 'cartModal',
          size: 'lg',
          scope: $scope,
          resolve: {
            currentItem: function () {
              return $scope.currentItem;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          //$scope.selected = selectedItem;
        }, function () {
        });

    };

});
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
/**
 * 
 * Controller for clip art
 * 
 */
angular.module('app').controller('ImagesGraphicsController', function( $scope, $location, $urlRouter, $stateParams, $http, $timeout, ApiService, $state) {
    
    this.name = "ImagesGraphicsController";
    this.params = $stateParams;

    $scope._ = _;
    $scope.clipArt = null;
    $scope.categories = null;
    window.scope = $scope;

    $scope.setActiveTab('images');

    $scope.addClipart = function(img) {
        console.log('img', img);
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

			var fill = getBorderColor(_.first($scope.currentItem.variant.colors));
			if(fill == '#FFFFFF') {
				var editable = $scope.canvas.getActiveObject();
				_.each(editable.paths, function(path, index) {
					
                    if(angular.isUndefined(path.fill.type)) {
						if(path.fill == '#000000') {
							path.fill = '#FFFFFF';
						}                        
                    }
                    
                });
				$scope.canvas.item(editable);
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
            }
        });

    };
    
    $scope.setCategory = function(category) {
         $scope.selectedCategory = category;
    };

    $scope.clipArtImage = function(clipArt) {
        return ApiService.Url(clipArt.path);
    }
    
    $scope.loadClipArt = function() {
        var clipArtUrl = ApiService.Url("clip_art.php");
        $http({method: 'GET', url: clipArtUrl, cache: false}).
        success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.clipArt = data;
            $scope.categories = _.uniq(_.pluck($scope.clipArt, 'category'));
            $scope.selectedCategory = _.first($scope.categories);
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    $scope.loadClipArt();

    $scope.init = function() {
    };
    $scope.init();
	
	
	//added for certain clients
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


});
/**
 * 
 * Controller for uploading images
 * 
 */
angular.module('app').controller('ImagesUploadController', function( $scope, $location, $urlRouter, $stateParams, $http, $upload, $timeout, ApiService) {

  this.name = "ImagesUploadController";
  this.params = $stateParams;

  $scope._ = _;
  $scope.progress = 0;
  $scope.file = null;
  $scope.src = null;
  $scope.whitespace = 0;
  $scope.error = false;
  $scope.setActiveTab('images');

  $scope.humanFileSize = function(bytes) {
    bytes = parseInt(bytes);
    var thresh = 1024;
        if(bytes < thresh) return bytes + ' B';
        var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(bytes >= thresh);
        return bytes.toFixed(1)+' '+units[u];
  };

  $scope.onFileSelect = function($files) {
	  console.log($files);
      $scope.error = false;
      $scope.progress = 0;

      if($files.length > 1) {
        $scope.error = "Please upload only one item at a time!";
        return;
      }
      $scope.src = "css/images/loading_blank.gif";
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {

        if ($files[i].type.indexOf('image') === -1) {
          $scope.error = "Only images are allowed";
          continue;
        }

        $scope.file = $files[i];
        var fileReader = new FileReader();
        fileReader.readAsDataURL($files[i]);

        var loadFile = function(fileReader, index) {
          fileReader.onload = function(e) {
           $timeout(function() {
            $scope.src = e.target.result;
          });
         }
       }(fileReader, i);

        //.error(...)
        //.then(success, error, progress); 
        // access or attach event listeners to the underlying XMLHttpRequest.
        //.xhr(function(xhr){xhr.upload.addEventListener(...)})
      }
      /* alternative way of uploading, send the file binary with the file's content-type.
         Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
         It could also be used to monitor the progress of a normal http post/put request with large data*/
      // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
    };

    $scope.startUpload = function() {
      $scope.progress = 1;
console.log('$scope.whitespace', $scope.whitespace);
      $scope.upload = $upload.upload({
        url: ApiService.Url("upload.php"),
          method: 'POST',
          withCredentials: true,
		  data: {'whitespace': $scope.whitespace},
		  fields: {'whitespace': $scope.whitespace},
          file: $scope.file
        }).progress(function(evt) {
          $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          $scope.addImage(  $scope.uploadURL(data.filepath) );
          $scope.file = null;
        });
      };


  $scope.setWhiteSpace = function(whitespace) {
	  $scope.whitespace = whitespace;
	  console.log('setWhiteSpace', $scope.whitespace);
  };
	
  $scope.init = function() {
  };
  
  $scope.init();

});


/**
 * 
 * Controller for browsing and selecting products
 * 
 */
angular.module('app').controller('ProductBrowserController', function( $scope, $location, $urlRouter, $stateParams, $modalInstance, ProductService, ApiService, CartService, PriceService) {

    this.name = "ProductBrowserController";
    this.params = $stateParams;

    window.scope = $scope;
    $scope.text = "ProductBrowserController";
    $scope.categories = null;
    $scope.selectedCategory = null;
    $scope.products = null;
    $scope.money = PriceService;
    $scope.selectedProduct = null;
    $scope.catalog = null;


    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };    

    $scope.dismiss = function() {
        $scope.$dismiss();
    };

    $scope.save = function() {
        item.update().then(function() {
            $scope.$close(true);
        });
    };

    $scope.setSelectedVariant = function(variant) {
        $scope.selectedVariant = variant;
    };

    $scope.confirmProduct = function() {
        //save selection
        var url = 'product/selection/' + $scope.selectedProduct.slug + "/" + $scope.selectedVariant.slug;
        $location.path(url);
        $scope.$dismiss();
    };

    $scope.selectProduct = function(product) {
        $scope.selectedProduct = product;
        console.log(product.variants, product.defaultVariant, _.find(product.variants, {name : product.defaultVariant}));
        $scope.setSelectedVariant(_.find(product.variants, {name : product.defaultVariant}));


    };    

    $scope.selectCategory = function(category) {
        $scope.selectedCategory = category;
        $scope.products = _.where($scope.catalog, {category : category.name});
        $scope.selectProduct($scope.products[0]);
    };
    
    $scope.getProducts = function() {
        ProductService.getProducts().then(function(data) {

            $scope.categories = data.categories;
            $scope.catalog = data.products;

            var currentItem = CartService.getSelectedItem();
            
            var category = _.first($scope.categories);
            var product = _.find(data.products, {category: category.name});
            console.log(category.name, product);
            $scope.selectCategory(category);
            $scope.selectProduct(product);

        });
    }
  
    $scope.init = function() {
        $scope.getProducts();
	};
    
    $scope.init();
    
});
/**
 * 
 * Controller for viewing a product and switching a product variant
 * 
 */
angular.module('app').controller('ProductController', function( $scope, $location, $urlRouter, $stateParams, ApiService, ProductService, CartService) {
	this.name = "ProductController";
	this.params = $stateParams;
    window.scope = $scope;
	$scope.setActiveTab('product');

    $scope.setSelectedVariant = function(variant) {
        CartService.updateItem($scope.currentItem.product, variant, CartService.selectedItemId);
        $scope.selectedVariant = variant;

        //set the control colors
        $scope.borderColor = getBorderColor(_.first($scope.currentItem.variant.colors));
        $('#designer-container').data('border',  $scope.borderColor);
    };

    $scope.init = function() {
    };
    $scope.init();	


});
/**
 * 
 * Controller for selecting a product
 * 
 */
angular.module('app').controller('ProductSelectionController', function( $scope, $location, $urlRouter, $stateParams, $http, ApiService, ProductService, $state, CartService) {

    this.name = "ProductSelectionController";
    $scope.setActiveTab('product');

    $scope.selectProduct = function() {

        //select my product    
        ProductService.getProducts().then(function(data) {

            var product = _.find(data.products, {slug : $stateParams['productSlug']});
            var variant = _.find(product.variants, {slug : $stateParams['variantSlug']});
			
            CartService.updateItem(product, variant, CartService.selectedItemId);
            ProductService.setOrientation(_.findKey($scope.currentItem.variant.orientations));
            $scope.setOrientation(_.findKey($scope.currentItem.variant.orientations));
            console.log("CHANGE FRAME");
            //resize canvas
            $scope.updateOrientation();

            //change border colors
            $scope.borderColor = getBorderColor(_.first($scope.currentItem.variant.colors));
            $('#designer-container').data('border',  $scope.borderColor);

            //preload images loaded
            _.each($scope.currentItem.variant.orientations, function(img, orientation) { 
                var image_url = $scope.imageUrl( {product:$scope.currentItem.product.slug, w:$scope.designerWidth, h:$scope.designerHeight, variant:$scope.currentItem.variant.slug, orientation:orientation} );
                var image = new Image();
                image.src = image_url;
            });
            

            $state.go('app.product.home');
        });

	};
	
	$scope.$watch('isReady', function(newValue, oldValue) {
		if($scope.isReady) {
			$scope.selectProduct();
		}
    });
	
    $scope.init = function() {
		if($scope.isReady) {
			$scope.selectProduct();
		}
    };
    
    $scope.init();
    
});
/**
 * 
 * Controller for adding text
 * 
 */
angular.module('app').controller('TextController', function( $scope, $location, $urlRouter, $stateParams, $state, $timeout, $http, ApiService, $interval, FontService) {
    this.name = "TextController";
    this.params = $stateParams;
    $scope.addText = "";
	window.scope = $scope;
    $scope._ = _;
    $scope.fonts = [];
    $scope.FontService = FontService;
    $scope.fontCategories = [];
    $scope.selectedFontCategory = 'Display';
    $scope.selectedFont = [];
    $scope.fontSelectionWindow = false;
    $scope.setActiveTab('text');
    $scope.$watch('isReady', function(newValue, oldValue) {
        $scope.loadFonts();
    });
	$scope.setSelectedFont = function(font) {
        $scope.selectedFont = font;
        $scope.hideFontSelector();
    }    
	$scope.showFontSelector = function() {
        $scope.fontSelectionWindow = true;
    }
    
	$scope.hideFontSelector = function() {
        $scope.fontSelectionWindow = false;
    }
    
	$scope.loadFonts = function() {
        //console.log('FontService.fontList', FontService.fontList);
        $scope.fonts = FontService.fontList;
        $scope.fontCategories = FontService.fontCategories;
        $scope.selectedFont = _.findWhere(window.scope.fonts, {name: $scope.defaultFont});
    }
    
	$scope.font_image = function(font_image) {
        return ApiService.fontUrl(font_image);
    }
    
	$scope.add_text = function() {
        
        //now add the stylesheet
        FontService.loadFont($scope.selectedFont);
		
		//set the control colors
        var fill = getBorderColor(_.first($scope.currentItem.variant.colors));
		
		var text = new fabric.Text($scope.addText, {
			left: 100,
			top: 10,
			fill: fill,
			fontFamily: $scope.selectedFont.regular.fontface,
			radius: 0,
			fontSize: 50,
            textAlign: 'center',
			spacing: 0
		});
		$scope.canvas.add(text);
		
		$scope.canvas.setActiveObject($scope.canvas.item($scope.canvas.getObjects().length - 1)); 
        $scope.canvas.item($scope.editableItem).centerH();

        console.log($scope.selectedFont.regular.fontface, isFontAvailable($scope.selectedFont.regular.fontface));
        var stop = $interval(function() {

          if (isFontAvailable($scope.selectedFont.regular.fontface)) {
            var object = $scope.canvas.item($scope.editableItem);

            object.setFontFamily( $scope.selectedFont.regular.fontface );
            object.set( 'fontName', $scope.selectedFont.name );
            $scope.defaultFont = $scope.selectedFont.name;

            //
            var max_width = $scope.canvas.width * 0.9;
            var max_height = $scope.canvas.height * 0.9;
            var new_width = max_width;
            if(object.getWidth() < max_width) {
                new_width = object.getWidth();
            }
            var width_ratio = new_width  / object.getWidth(); //find ratio
        
            var newfontsize = (object.fontSize * width_ratio)
            object.setFontSize(parseInt(newfontsize, 10));
            object.setScaleX(1);
            object.setScaleY(1);
            object.centerH();

            $scope.editable.fontSize = object.fontSize;

            $scope.drawCanvas();
            $interval.cancel(stop);

            if($scope.isMobile) {
                $scope.editMode = 'text';
                $state.go('app.product.home');
                $scope.showMobileDesigner();
            }
          }
        }, 100);

		$scope.drawCanvas();
	  
	};
    
    $scope.setFontCategory = function(category) {
        $scope.selectedFontCategory = category;  
    };
}); 
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
angular.module('app').factory('ApiService', function( ) {

  return {
    baseUrl: function(url) {
      if(window.location.host.indexOf("localhost:") > -1) {
        return "http://localhost/apps/tshirt_test/"; //only used for development
      } else {
        return "../";
      }
    },    
    Url: function(url) {
      return this.baseUrl() + "api/" + url;
    },    
    fontUrl: function(url) {
      return this.baseUrl() + "data/" + url;
    },
    imageUrl: function(data) {
      return this.baseUrl() + "api/image.php?" + $.param( data );
    },    
    imageTransparentUrl: function(data) {
      return this.baseUrl() + "api/image_transparent.php?" + $.param( data );
    },
    uploadURL: function(src) {
      return this.baseUrl() + "storage/uploads/" + src;
    }
  };
  
});
angular.module('app').service('CanvasService', function( localStorageService ) {

	this.orientations = {};
	this.orientation_canvases = {};
	this.orientation_data = {};

	this.init = function(){
		
		var orientations = localStorageService.get('orientations');
		if(orientations) {
			this.orientations = orientations;
		}		
		var orientation_data = localStorageService.get('orientation_data');
		if(orientation_data != null) {
			this.orientation_data = orientation_data;
		}

	};

	this.setOrientationDesign = function(orientation, canvas){
		this.orientations[orientation] = canvas.toJSON(['original_colors', 'fontName']);
        this.orientation_canvases[orientation] = canvas;
        
		localStorageService.set('orientations', this.orientations);
		localStorageService.set('orientation_canvases', this.orientation_canvases);
	};

	this.generateOrientationImage = function(orientation, image_data){
        
        this.orientation_data[orientation] = {}
        this.orientation_data[orientation]['background'] = image_data.background;
        this.orientation_data[orientation]['offset_x'] = image_data.offset_x;
        this.orientation_data[orientation]['offset_y'] = image_data.offset_y;
        this.orientation_data[orientation]['image_width'] = image_data.image_width;
        this.orientation_data[orientation]['image_height'] = image_data.image_height;
        this.orientation_data[orientation]['background_width'] = image_data.background_width;
        this.orientation_data[orientation]['background_height'] = image_data.background_height;
                
        if(angular.isDefined(this.orientation_canvases[orientation])) {
            var canvas = this.orientation_canvases[orientation];
            this.orientation_data[orientation]['image'] = canvas.deactivateAll().toDataURL();
        } else {
            this.orientation_data[orientation]['image'] = null;
        }
        
        localStorageService.set('orientation_data', this.orientation_data);
            
	};

	this.getOrientationDesign = function(orientation){
		return this.orientations[orientation];
	};
	this.getOrientationImage = function(orientation){
		return this.orientation_data[orientation];
	};	
    this.getOrientationData = function(orientation){
		return this.orientation_data;
	};

	this.init();

});

angular.module('app').service('CartService', function( localStorageService, PriceService ) {

	this.cart = [];
	this.cumulativeCount = 0;
	this.itemId = 0;
	this.selectedItemId = 0;

	this.init = function(){
		
		var cart = localStorageService.get('cart.items');
		if(cart) {
			this.cart = cart;
		} else {
			this.cart = [];
		}

		var selectedItemId = localStorageService.get('cart.selectedItemId');
		if(selectedItemId) {
			this.selectedItemId = selectedItemId;
		} else {
			this.selectedItemId = 0;
		}

		this.cumulativeCount = this.cart.length;

	};
	
	this.reset = function(){
		localStorageService.remove('cart.items');
		localStorageService.remove('cart.selectedItemId');
		this.init();
	};

	this.setSelectedItem = function(selectedItemId){
		this.selectedItemId = selectedItemId;
		localStorageService.set('cart.selectedItemId', this.selectedItemId);
	};

	this.getSelectedItem = function(){
		var selectedItemId = localStorageService.get('cart.selectedItemId');
		if(selectedItemId) {
			this.selectedItemId = selectedItemId;
		} else {
			return false;
		}
		var item = _.find(this.cart, {id: this.selectedItemId});
		return item;
	};

	this.updateItem = function(product, variant, itemId){
		this.itemId = itemId;

		var item = _.find(this.cart, {id: this.itemId});
		item.id = this.itemId;
		item.product = product;
		item.variant = variant;
		item.orientations = {};
		item.price = variant.price; //base price
		item.single_price = variant.price; //base price

		item.quantities = {};
        _.each(product.sizes, function(size) {
            item.quantities[size] = 0;
        });

        item.total_quantity =  _.reduce(this.quantities, function(memo, num) {
                        	num = parseInt(num);
                        	return memo + num;
                    	}, 0);
		item.total_price = item.single_price * item.total_quantity;

		this.insert(item);
		this.setSelectedItem(this.itemId);
	};

	this.updateItemCanvas = function(orientation, canvas, itemId){
		this.itemId = itemId;
		var item = _.find(this.cart, {id: this.itemId});
		
		item.canvases[orientation] = canvas.toJSON(['original_colors', 'fontName']);

		//make the image - it's saved in local storage so we'll always have an image
		canvas.clone(function (data) {
            var new_canvas = data;
            item.images[orientation] = new_canvas.toDataURL();
        });
		
		item.layers = this.calculateLayers(item);
		
		item.single_price = this.calculateSinglePrice(item, item.layers.colors);
        item.total_quantity =  _.reduce(this.quantities, function(memo, num) {
                        	num = parseInt(num);
                        	return memo + num;
                    	}, 0);
		item.total_price = item.single_price * item.total_quantity;

		this.insert(item);
		localStorageService.set('cart.items', this.cart);
	};

	this.calculateLayers = function(item){
		//colors per side
        //get the active orientations
        var data = {};
        data.orientations = _.size( item.variant.orientations );
        data.orientations_designed = 0;
        data.orientations_layers = [];
        data.colors = {};
        _.each(item.variant.orientations, function(img, orientation) {
        	data.colors[orientation] = 0;
            var orientationObjects = item.canvases[orientation];
            var orientation_layers = {};
            
            data.orientations_designed = data.orientations_designed + 1;
            orientation_layers.name = orientation;

            if(!angular.isUndefined(orientationObjects)) {

                orientation_layers.count = orientationObjects.objects.length;
                orientation_layers.photos = _.size( _.where(orientationObjects.objects, {type:"image"}) );
                orientation_layers.text = _.size( _.where(orientationObjects.objects, {type:"i-text"}) );
                orientation_layers.graphics = _.size( _.where(orientationObjects.objects, {type:"path-group"}) );

                var fills = [];
                var colors = 0;
                //var fills = _.pluck(j.objects[0].paths, 'fill');
                _.each(orientationObjects.objects, function(object) {

                    if(object.type == "path-group") {
                        _.each(object.paths, function(path) {
                            if(path.fill.charAt(0) == '#') {
	                        	if(path.fill) {
	                            	fills.push(path.fill);
	                        	}
	                        	if(path.stroke) {
	                            	fills.push(path.stroke);
	                            }
                            }
                        });
                        
                    }
                    
                    if(object.type === 'i-text' || object.type === 'text' ) {
                        _.each(object.paths, function(path) {
                        	if(object.fill) {
                            	fills.push(object.fill);
                        	}
                        	if(object.stroke) {
                            	fills.push(object.stroke);
                            }
                        });
                    }                    
                    if(object.type === 'image' ) {
                        fills.push('INF');
                    }

                });

                orientation_layers.fills = _.uniq(fills);
                data.colors[orientation] = _.size(orientation_layers.fills);
                if(_.contains(fills, 'INF')) {
					data.colors[orientation] = 'INF';
                }
            } else {

                orientation_layers.colors = 0;
                orientation_layers.count = 0;
                orientation_layers.photos = 0;
                orientation_layers.text = 0;
                orientation_layers.graphics = 0;
                orientation_layers.fills = [];
                data.colors[orientation] = 0;

            }

            data.orientations_layers.push(orientation_layers);

        });

        return data;
	};
	
	//here we calculate the total price for one item
	this.calculateSinglePrice = function(item, colors){

		var price = parseFloat(item.variant.price);
		price += this._calculateLayerCost(item);

        return price;

	};

	this._parseTextLayer = function(layer){
		var colors = [];
		colors.push(layer.fill);
		colors.push(layer.stroke);
		return colors;
	};

	this._parseGraphicLayer = function(layer){
		var colors = [];
		_.each(layer.paths, function(path) {
			colors.push(path.fill);
			colors.push(path.stroke);
		});
		return colors;
	};

	this._cleanColors = function(colors){
		//get rid of duplicates
		colors = _.unique(colors);
		var color_list = [];
		_.each(colors, function(color) {
			if(color && color.charAt(0) == '#') {
				color_list.push(color);
			}
		});
		return color_list;
	};

	this._calculateOrientationPrice = function(colors, has_photo){
		var pricing = PriceService.pricing;
		
		var total_colors = _.size(colors);
		var max_count_set = _.size(pricing);
		if(total_colors > max_count_set || has_photo) {
			total_colors = 'INF';
		}

		var price = 0;
		if( !_.isUndefined(pricing[total_colors]) ) {
			price = parseFloat(pricing[total_colors]);
		}
		return parseFloat(price);
	};

	this._calculateLayerCost = function(item){

		var colors = {};
		var orientation_pricing = {};
		var self = this;
        var charges_per_side = PriceService.charges_per_side;
        
		_.each(item.canvases, function(layers, orientation) {
			colors[orientation] = [];
			var has_photo = false;

			_.each(layers.objects, function(layer) {

				if(_.isEqual(layer.type, 'text') || _.isEqual(layer.type, 'i-text') ) {
					colors[orientation] = colors[orientation].concat(self._parseTextLayer(layer));
				}			
				if( _.isEqual(layer.type, 'path-group') ) {
					colors[orientation] = colors[orientation].concat(self._parseGraphicLayer(layer));
				}			
				if( _.isEqual(layer.type, 'image') ) {
					has_photo = true;
				}
			});

			colors[orientation] = self._cleanColors(colors[orientation]);
			orientation_pricing[orientation] = self._calculateOrientationPrice(colors[orientation], has_photo);

        });

		var total_pricing = _.reduce(_.values(orientation_pricing), function(sum, el) {
		  return sum + el
		}, 0);

        //this adds additional pricing per side
        var total_sides = _.reduce(_.values(colors), function(sum, el) {
            var has_content = (_.size(el) > 0 ? 1 : 0);
            return sum + has_content;
		}, 0);
        
        var sideCharge = _.find(charges_per_side, {'sides' : total_sides});        
        if(!_.isUndefined(sideCharge)) {
            total_pricing = total_pricing + sideCharge.price;
        }
        //console.log( "additional pricing per side", total_pricing );
        
		return total_pricing;
	};


	this.sumQuantities = function(quantities){
		localStorageService.set('cart.items', this.cart); //just to update the quantities
        var quantity =  _.reduce(quantities, function(memo, num){
                            num = parseInt(num);
                            return memo + num;
                        }, 0);
        return quantity;
    };

    this.sumPrice = function(quantities, price){
        var quantity = this.sumQuantities(quantities);
        price = accounting.unformat(price);
        var sum_price = price * quantity;
        
        //ist the quantity between 
        var discount_rate = 0;
        _.each(PriceService.bulk_discounts, function(bulk_discount) {
            
            var price_upper_limit = (bulk_discount['to'] == 'INF' ? Number.POSITIVE_INFINITY : parseInt(bulk_discount['to']));
            //console.log(quantity, bulk_discount['from'], price_upper_limit, bulk_discount['discount']);
            if( quantity >= parseInt(bulk_discount['from']) && quantity <= price_upper_limit ) {
                discount_rate = parseFloat(bulk_discount['discount']);
            }
        });
        
        if(discount_rate > 0) {
            var discount = sum_price*(discount_rate/100);
            sum_price = sum_price - discount;
        }
        
        return sum_price;
    };   

    this.sumTotalPrice = function(){
 
        var total_price = 0;
		var self = this;
        _.each(this.cart, function(item) {
			item.total_quantity =  _.reduce(item.quantities, function(memo, num) {
			                	num = parseInt(num);
			                	return memo + num;
			            	}, 0);
			item.total_price = self.sumPrice(item.quantities, item.single_price);
			item.discount_price = (item.total_price/item.total_quantity);
            total_price += item.total_price;
        });
        
        return total_price;

    };

	this.generateUUID = function(){
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	};

	this.newItem = function(product, variant){
		this.itemId = this.generateUUID();

		//each item needs this
		var item = {};
		item.id = this.itemId;
		item.product = product;
		item.variant = variant;
		item.orientations = {};
		item.price = variant.price; //base price
		item.single_price = variant.price; //base price
		item.total_price = 0; //no quantity
		item.total_quantity = 0; //no quantity
		item.canvases = {}; //store the canvas for each orientation here
		item.images = {}; //store the canvas images
		item.layers = {}; //store the layers for each orientation
		
		item.quantities = {};
        _.each(product.sizes, function(size) {
            item.quantities[size] = 0;
        });

		this.insert(item);
		this.setSelectedItem(this.itemId);
		return item;
	};
	
	this.duplicateItem = function(item){
		this.itemId = new Date().getUTCMilliseconds();

		//each item needs this
		var newItem = jQuery.extend(true, {}, item);
		newItem.id = this.itemId;

		this.insert(newItem);
		this.setSelectedItem(this.itemId);
		return newItem;
	};

	this.insert = function(item){

		var exists = _.find(this.cart, {id: item.id});

		if(exists) {
			var index = _.indexOf(this.cart, exists);
			
			this.cart[index] = _.extend(this.cart[index], item);
		} else {
	        this.cart.push({
	            id          	:   item.id,
	            product  		:   item.product,
	            variant  		:   item.variant,
	            orientations  	:   item.orientations,
	            quantities  	:   item.quantities,
	            canvases  		:   item.canvases,
	            images  		:   item.images,
	            price       	:   item.price,	            
	            single_price    :   item.single_price,
	            total_price    	:   item.total_price,
	            total_quantity 	:   item.total_quantity
	        });
	        this.cumulativeCount += 1;
    	}

        localStorageService.set('cart.items', this.cart);
	};
    
	this.update = function(orientation, canvas){

	};    
    
	this.remove = function(itemId){
		this.cart = _.without(this.cart, _.findWhere(this.cart, {id: itemId}));
		
		localStorageService.set('cart.items', this.cart);

		if(this.selectedItemId == itemId) {
			var first = _.first(this.cart);
			if(first) {
				this.setSelectedItem(first.id);	//select first item
			}
		}

	};    
    
	this.destroy = function(orientation, canvas){

	};
    
	this.totalItems = function(orientation, canvas){

	};
    
	this.getTotalPrice = function(){
		return 20;
	};
    
	this.getItems = function(){
		return this.cart;
	};

	this.init();

});

'use strict';

angular.module('countrySelect', [])
  .directive('countrySelect', ['$parse', function($parse) {
    var countries = [
      { code: "af", name: "Afghanistan" },
      { code: "ax", name: "Åland Islands" },
      { code: "al", name: "Albania" },
      { code: "dz", name: "Algeria" },
      { code: "as", name: "American Samoa" },
      { code: "ad", name: "Andorra" },
      { code: "ao", name: "Angola" },
      { code: "ai", name: "Anguilla" },
      { code: "aq", name: "Antarctica" },
      { code: "ag", name: "Antigua and Barbuda" },
      { code: "ar", name: "Argentina" },
      { code: "am", name: "Armenia" },
      { code: "aw", name: "Aruba" },
      { code: "au", name: "Australia" },
      { code: "at", name: "Austria" },
      { code: "az", name: "Azerbaijan" },
      { code: "bs", name: "Bahamas" },
      { code: "bh", name: "Bahrain" },
      { code: "bd", name: "Bangladesh" },
      { code: "bb", name: "Barbados" },
      { code: "by", name: "Belarus" },
      { code: "be", name: "Belgium" },
      { code: "bz", name: "Belize" },
      { code: "bj", name: "Benin" },
      { code: "bm", name: "Bermuda" },
      { code: "bt", name: "Bhutan" },
      { code: "bo", name: "Bolivia, Plurinational State of" },
      { code: "bq", name: "Bonaire, Sint Eustatius and Saba" },
      { code: "ba", name: "Bosnia and Herzegovina" },
      { code: "bw", name: "Botswana" },
      { code: "bv", name: "Bouvet Island" },
      { code: "br", name: "Brazil" },
      { code: "io", name: "British Indian Ocean Territory" },
      { code: "bn", name: "Brunei Darussalam" },
      { code: "bg", name: "Bulgaria" },
      { code: "bf", name: "Burkina Faso" },
      { code: "bi", name: "Burundi" },
      { code: "kh", name: "Cambodia" },
      { code: "cm", name: "Cameroon" },
      { code: "ca", name: "Canada" },
      { code: "cv", name: "Cape Verde" },
      { code: "ky", name: "Cayman Islands" },
      { code: "cf", name: "Central African Republic" },
      { code: "td", name: "Chad" },
      { code: "cl", name: "Chile" },
      { code: "cn", name: "China" },
      { code: "cx", name: "Christmas Island" },
      { code: "cc", name: "Cocos (Keeling) Islands" },
      { code: "co", name: "Colombia" },
      { code: "km", name: "Comoros" },
      { code: "cg", name: "Congo" },
      { code: "cd", name: "Congo, the Democratic Republic of the" },
      { code: "ck", name: "Cook Islands" },
      { code: "cr", name: "Costa Rica" },
      { code: "ci", name: "Côte d'Ivoire" },
      { code: "hr", name: "Croatia" },
      { code: "cu", name: "Cuba" },
      { code: "cw", name: "Curaçao" },
      { code: "cy", name: "Cyprus" },
      { code: "cz", name: "Czech Republic" },
      { code: "dk", name: "Denmark" },
      { code: "dj", name: "Djibouti" },
      { code: "dm", name: "Dominica" },
      { code: "do", name: "Dominican Republic" },
      { code: "ec", name: "Ecuador" },
      { code: "eg", name: "Egypt" },
      { code: "sv", name: "El Salvador" },
      { code: "gq", name: "Equatorial Guinea" },
      { code: "er", name: "Eritrea" },
      { code: "ee", name: "Estonia" },
      { code: "et", name: "Ethiopia" },
      { code: "fk", name: "Falkland Islands (Malvinas)" },
      { code: "fo", name: "Faroe Islands" },
      { code: "fj", name: "Fiji" },
      { code: "fi", name: "Finland" },
      { code: "fr", name: "France" },
      { code: "gf", name: "French Guiana" },
      { code: "pf", name: "French Polynesia" },
      { code: "tf", name: "French Southern Territories" },
      { code: "ga", name: "Gabon" },
      { code: "gm", name: "Gambia" },
      { code: "ge", name: "Georgia" },
      { code: "de", name: "Germany" },
      { code: "gh", name: "Ghana" },
      { code: "gi", name: "Gibraltar" },
      { code: "gr", name: "Greece" },
      { code: "gl", name: "Greenland" },
      { code: "gd", name: "Grenada" },
      { code: "gp", name: "Guadeloupe" },
      { code: "gu", name: "Guam" },
      { code: "gt", name: "Guatemala" },
      { code: "gg", name: "Guernsey" },
      { code: "gn", name: "Guinea" },
      { code: "gw", name: "Guinea-Bissau" },
      { code: "gy", name: "Guyana" },
      { code: "ht", name: "Haiti" },
      { code: "hm", name: "Heard Island and McDonald Islands" },
      { code: "va", name: "Holy See (Vatican City State)" },
      { code: "hn", name: "Honduras" },
      { code: "hk", name: "Hong Kong" },
      { code: "hu", name: "Hungary" },
      { code: "is", name: "Iceland" },
      { code: "in", name: "India" },
      { code: "id", name: "Indonesia" },
      { code: "ir", name: "Iran, Islamic Republic of" },
      { code: "iq", name: "Iraq" },
      { code: "ie", name: "Ireland" },
      { code: "im", name: "Isle of Man" },
      { code: "il", name: "Israel" },
      { code: "it", name: "Italy" },
      { code: "jm", name: "Jamaica" },
      { code: "jp", name: "Japan" },
      { code: "je", name: "Jersey" },
      { code: "jo", name: "Jordan" },
      { code: "kz", name: "Kazakhstan" },
      { code: "ke", name: "Kenya" },
      { code: "ki", name: "Kiribati" },
      { code: "kp", name: "Korea, Democratic People's Republic of" },
      { code: "kr", name: "Korea, Republic of" },
      { code: "kw", name: "Kuwait" },
      { code: "kg", name: "Kyrgyzstan" },
      { code: "la", name: "Lao People's Democratic Republic" },
      { code: "lv", name: "Latvia" },
      { code: "lb", name: "Lebanon" },
      { code: "ls", name: "Lesotho" },
      { code: "lr", name: "Liberia" },
      { code: "ly", name: "Libya" },
      { code: "li", name: "Liechtenstein" },
      { code: "lt", name: "Lithuania" },
      { code: "lu", name: "Luxembourg" },
      { code: "mo", name: "Macao" },
      { code: "mk", name: "Macedonia, the former Yugoslav Republic of" },
      { code: "mg", name: "Madagascar" },
      { code: "mw", name: "Malawi" },
      { code: "my", name: "Malaysia" },
      { code: "mv", name: "Maldives" },
      { code: "ml", name: "Mali" },
      { code: "mt", name: "Malta" },
      { code: "mh", name: "Marshall Islands" },
      { code: "mq", name: "Martinique" },
      { code: "mr", name: "Mauritania" },
      { code: "mu", name: "Mauritius" },
      { code: "yt", name: "Mayotte" },
      { code: "mx", name: "Mexico" },
      { code: "fm", name: "Micronesia, Federated States of" },
      { code: "md", name: "Moldova, Republic of" },
      { code: "mc", name: "Monaco" },
      { code: "mn", name: "Mongolia" },
      { code: "me", name: "Montenegro" },
      { code: "ms", name: "Montserrat" },
      { code: "ma", name: "Morocco" },
      { code: "mz", name: "Mozambique" },
      { code: "mm", name: "Myanmar" },
      { code: "na", name: "Namibia" },
      { code: "nr", name: "Nauru" },
      { code: "np", name: "Nepal" },
      { code: "nl", name: "Netherlands" },
      { code: "nc", name: "New Caledonia" },
      { code: "nz", name: "New Zealand" },
      { code: "ni", name: "Nicaragua" },
      { code: "ne", name: "Niger" },
      { code: "ng", name: "Nigeria" },
      { code: "nu", name: "Niue" },
      { code: "nf", name: "Norfolk Island" },
      { code: "mp", name: "Northern Mariana Islands" },
      { code: "no", name: "Norway" },
      { code: "om", name: "Oman" },
      { code: "pk", name: "Pakistan" },
      { code: "pw", name: "Palau" },
      { code: "ps", name: "Palestine, State of" },
      { code: "pa", name: "Panama" },
      { code: "pg", name: "Papua New Guinea" },
      { code: "py", name: "Paraguay" },
      { code: "pe", name: "Peru" },
      { code: "ph", name: "Philippines" },
      { code: "pn", name: "Pitcairn" },
      { code: "pl", name: "Poland" },
      { code: "pt", name: "Portugal" },
      { code: "pr", name: "Puerto Rico" },
      { code: "qa", name: "Qatar" },
      { code: "re", name: "Réunion" },
      { code: "ro", name: "Romania" },
      { code: "ru", name: "Russian Federation" },
      { code: "rw", name: "Rwanda" },
      { code: "bl", name: "Saint Barthélemy" },
      { code: "sh", name: "Saint Helena, Ascension and Tristan da Cunha" },
      { code: "kn", name: "Saint Kitts and Nevis" },
      { code: "lc", name: "Saint Lucia" },
      { code: "mf", name: "Saint Martin (French part)" },
      { code: "pm", name: "Saint Pierre and Miquelon" },
      { code: "vc", name: "Saint Vincent and the Grenadines" },
      { code: "ws", name: "Samoa" },
      { code: "sm", name: "San Marino" },
      { code: "st", name: "Sao Tome and Principe" },
      { code: "sa", name: "Saudi Arabia" },
      { code: "sn", name: "Senegal" },
      { code: "rs", name: "Serbia" },
      { code: "sc", name: "Seychelles" },
      { code: "sl", name: "Sierra Leone" },
      { code: "sg", name: "Singapore" },
      { code: "sx", name: "Sint Maarten (Dutch part)" },
      { code: "sk", name: "Slovakia" },
      { code: "si", name: "Slovenia" },
      { code: "sb", name: "Solomon Islands" },
      { code: "so", name: "Somalia" },
      { code: "za", name: "South Africa" },
      { code: "gs", name: "South Georgia and the South Sandwich Islands" },
      { code: "ss", name: "South Sudan" },
      { code: "es", name: "Spain" },
      { code: "lk", name: "Sri Lanka" },
      { code: "sd", name: "Sudan" },
      { code: "sr", name: "Suriname" },
      { code: "sj", name: "Svalbard and Jan Mayen" },
      { code: "sz", name: "Swaziland" },
      { code: "se", name: "Sweden" },
      { code: "ch", name: "Switzerland" },
      { code: "sy", name: "Syrian Arab Republic" },
      { code: "tw", name: "Taiwan, Province of China" },
      { code: "tj", name: "Tajikistan" },
      { code: "tz", name: "Tanzania, United Republic of" },
      { code: "th", name: "Thailand" },
      { code: "tl", name: "Timor-Leste" },
      { code: "tg", name: "Togo" },
      { code: "tk", name: "Tokelau" },
      { code: "to", name: "Tonga" },
      { code: "tt", name: "Trinidad and Tobago" },
      { code: "tn", name: "Tunisia" },
      { code: "tr", name: "Turkey" },
      { code: "tm", name: "Turkmenistan" },
      { code: "tc", name: "Turks and Caicos Islands" },
      { code: "tv", name: "Tuvalu" },
      { code: "ug", name: "Uganda" },
      { code: "ua", name: "Ukraine" },
      { code: "ae", name: "United Arab Emirates" },
      { code: "gb", name: "United Kingdom" },
      { code: "us", name: "United States" },
      { code: "um", name: "United States Minor Outlying Islands" },
      { code: "uy", name: "Uruguay" },
      { code: "uz", name: "Uzbekistan" },
      { code: "vu", name: "Vanuatu" },
      { code: "ve", name: "Venezuela, Bolivarian Republic of" },
      { code: "vn", name: "Viet Nam" },
      { code: "vg", name: "Virgin Islands, British" },
      { code: "vi", name: "Virgin Islands, U.S." },
      { code: "wf", name: "Wallis and Futuna" },
      { code: "eh", name: "Western Sahara" },
      { code: "ye", name: "Yemen" },
      { code: "zm", name: "Zambia" },
      { code: "zw", name: "Zimbabwe"}
    ];

    return {
      template: '<select ng-model="attrs.ngModel" ng-options="c.code as c.name for c in countries">',
      replace: true,
      link: function(scope, elem, attrs) {
        scope.countries = countries;
        
        if (!!attrs.ngModel) {
          var assignCountry = $parse(attrs.ngModel).assign;

          elem.bind('change', function(e) {
            assignCountry(elem.val());
          });

          scope.$watch(attrs.ngModel, function(country) {
            elem.val(country);
          });
        }
      }
    }
  }]);
angular.module('app').service('FontService', function( localStorageService, ApiService, $q, $interval, $http ) {

	this.fonts = {};
	this.fontList = [];
	this.fontCategories = [];

	this.init = function(){
		
		var fonts = localStorageService.get('fonts');
		if(fonts) {
			this.fonts = fonts;
		}

	};

	this.loadFont = function(font){
		//console.log('loadFont', font.regular.fontface);
		if (!isFontAvailable(font.regular.fontface)) {
			$('head').append('<link rel="stylesheet" type="text/css" href="'+ApiService.fontUrl(font.regular.stylesheet)+'">');
		}
		this.fonts[font.name] = font;
		localStorageService.set('fonts', this.fonts);
	};

	this.preloadFonts = function(){

		var self = this;
    	var deferred = $q.defer();

    	_.each(self.fonts, function(font) {
			if (!isFontAvailable(font.regular.fontface)) {
                        
				var fontRow = _.find(self.fontList, {name: font.name});
				if(!angular.isUndefined(fontRow)) {

					$('head').append('<link rel="stylesheet" type="text/css" href="'+ApiService.fontUrl(font.regular.stylesheet)+'">');
			        var stop = $interval(function() {
			          if (isFontAvailable(font.regular.fontface)) {
			            canvas.renderAll();
			            $interval.cancel(stop);
			          }
			        }, 100);

		        }
			}
		});
		deferred.resolve(self.fonts);
		return deferred.promise;

	};

	this.getFonts = function() {

		var self = this;
    	var deferred = $q.defer();

        $http({method: 'GET', url: ApiService.Url("fonts.php"), cache: false}).
        success(function(data, status, headers, config) {
            self.fontList = data;
            self.fontCategories = _.uniq(_.pluck(self.fontList, 'category'));
            deferred.resolve(self);
        }).
        error(function(data, status, headers, config) {
			deferred.reject(data);
        });
		return deferred.promise;

    }

	this.init();

});

angular.module('app').service('PriceService', function( localStorageService, ApiService, $http, $q ) {
    
    this.currency_code = 'USD';
    this.currency_symbol = '$';

	this.layers = null;
	this.delivery = false;
	this.quantities = false;
	this.price = 0;

	this.pricing = null;
	this.deliveryTypes = null;
	this.charges_per_side = null;
	this.bulk_discounts = null;

	this.getPricing = function(value){
		var self = this;
    	var deferred = $q.defer();

        //load pricing
        $http({method: 'GET', url: ApiService.Url("get_pricing.php"), cache: false}).
            success(function(data, status, headers, config) {
                self.pricing = data.pricing;
                self.deliveryTypes = data.delivery_types;
                self.charges_per_side = data.charges_per_side;
                self.bulk_discounts = data.bulk_discounts;
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
				deferred.reject(data);
            });

		return deferred.promise;
	};

	this.setPrice = function(value){
        localStorageService.set('checkout.price', value);
		this.price = value;
	};

	this.setPostage = function(value){
        localStorageService.set('checkout.postage', value);
		this.postage = value;
	};

	this.setPostageDescription = function(value){
        localStorageService.set('checkout.postage_description', value);
	};
	
	this.setQuantities = function(value){
        localStorageService.set('checkout.quantities', value);
		this.quantities = value;
	};

	this.setTitle = function(value){
        localStorageService.set('checkout.title', value);
	};
	this.setDescription = function(value){
        localStorageService.set('checkout.description', value);
	};
	this.setDelivery = function(value){
        localStorageService.set('checkout.delivery', value);
		this.delivery = value;
	};

	this.setLayers = function(value){
        localStorageService.set('checkout.layers', value);
		this.layers = value;
	};

	this.getPrice = function(){
        var price = localStorageService.get('checkout.price');
        if(price == null)
            price = 0;
		return price;
	};

	this.getQuantities = function(){
        var quantities = localStorageService.get('checkout.quantities');
        if(quantities == null)
            quantities = {};
		return quantities;
	};
    
	this.getDescription = function(){
        var description = localStorageService.get('checkout.description');
		return description;
	};
        
	this.getTitle = function(){
        var title = localStorageService.get('checkout.title');
		return title;
	};
    
	this.getTotalQuantity = function(){
        var quantities = this.getQuantities();
        var quantity =  _.reduce(quantities, function(memo, num)
                    {
                        num = parseInt(num);
                        return memo + num;
                    }, 0);
		return quantity;
	};

	this.getDelivery = function(){
        var delivery = localStorageService.get('checkout.delivery');
		return delivery;
	};
    
	this.getPostageDescription = function(){
        var postage_description = localStorageService.get('checkout.postage_description');
		return postage_description;
	};
    
	this.getPostage = function(){
        var postage = localStorageService.get('checkout.postage');
        if(postage == null)
            postage = 0;
		return postage;
	};

	this.setCurrency = function(currency_code){
    	this.currency_code = currency_code;
	};

	this.setCurrencySymbol = function(currency_symbol){
		this.currency_symbol = currency_symbol;
	};

	this.getCurrency = function(){
		return this.currency_code;
	};

	this.getCurrencySymbol = function(){
		return this.currency_symbol;
	};

	this.getLayers = function(){
        var layers = localStorageService.get('checkout.layers');
        if(layers == null)
            layers = {};
		return layers;
	};
	
	this.format = function(price){
		return accounting.formatMoney(price, this.getCurrencySymbol());
	};


});

angular.module('app').service('ProductService', function( ApiService, $http, $q ) {

	//store a list of products and categories
	this.categories = null;
	this.products = null;
	this.orientations = null;

	this.setOrientation = function(value){
		this.currentOrientation = value;
	};

	this.getOrientation = function(){
		return this.currentOrientation;
	};

	this.getOrientations = function(){
		return this.orientations;
	};
    
    this.getProducts = function() {
    	var self = this;
    	var deferred = $q.defer();
        $http({method: 'GET', url: ApiService.Url("get_products.php"), cache: true}).
            success(function(data, status, headers, config) {
                
                self.categories = data.categories;
                self.products = data.products;
            	deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                deferred.reject(data);
            });
		return deferred.promise;
    };

});

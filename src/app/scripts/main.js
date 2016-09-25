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
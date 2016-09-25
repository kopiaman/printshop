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

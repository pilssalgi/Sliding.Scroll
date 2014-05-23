
/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);


/* ************************************************************
 title  : Scroll ver 0.10
 date   : 2014.01
 author : Heowongeun
************************************************************ */


//scroll = new Scroll({speed:1.7, friction:0.89, touchSpeed:10, step:scrolling});

(function () {
    var _bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    var getPagePos = function(e){
        var pos, touch;
        pos = {x:0, y:0};
        if("ontouchstart" in window) {
            if (e.touches != null) {
                touch = e.touches[0];
            } else {
                touch = e.originalEvent.touches[0];
            }
            pos.x = touch.clientX;
            pos.y = touch.clientY;
        } else {
            pos.x = e.clientX;
            pos.y = e.clientY;
        }
        return pos;
    }
    /* *********************************************************
    *  Constructor 
    ********************************************************** */

    function Scroll(option){
        this.config     = {
            target      : document,
            speed       : 0.1,
            friction    : 0.94,
            touchSpeed  : 5,
            type        : "wheel",
            scrollType  : "y",
            screenFix   : false,
            scrollLimit : 30,
            step        : function(){},
            start       : function(){},
            stop        : function(){},
            touchStart  : function(){},
            touchMove   : function(){},
            touchEnd    : function(){}
        }

        $.extend(this.config,option);

        this.offset         = 0;
        this.offsetMax      = 0;
        this.offsetMin      = 0;      
        this.isRender       = false;
        this.renderingID;
        this.onRender       = _bind(this.onRender,this);
        
        //wheelEvent
        this.onWheel = _bind(this.onWheel,this);
        $(this.config.target).bind("mousewheel", this.onWheel);
        // $(this.config.target).bind("mousewheel", $.throttle( 10, this.onWheel ) );
        //touchEvent
        this.onTouchStart   = _bind(this.onTouchStart,this);
        this.onTouchMove    = _bind(this.onTouchMove,this);
        this.onTouchEnd     = _bind(this.onTouchEnd,this);

        $(this.config.target).bind("touchstart", this.onTouchStart);
        $(this.config.target).bind("touchmove", this.onTouchMove);
        $(this.config.target).bind("touchend", this.onTouchEnd);
    };

    Scroll.prototype.constructor = Scroll;
    Scroll.prototype.init = function(){

    }

    Scroll.prototype.optionChange = function(option){
        $.extend(this.config,option);
    }

    /* *********************************************************
    *  SCROLL EVENT 
    ********************************************************** */
    // Scroll.prototype.EVENT_TOUCHSTART       = "touch_start";
    // Scroll.prototype.EVENT_TOUCHEND         = "touch_end";

    // Scroll.prototype.EVENT_SCROLLSTART      = "scroll_start";
    // Scroll.prototype.EVENT_SCROLLAFTER      = "scroll_after";

    // Scroll.prototype.event_dispatch = function(event){
        // $(this).trigger(event);
    // }
    /* *********************************************************
    *  Event Handler
    ********************************************************** */
    
    Scroll.prototype.onTouchStart = function(e){
        // $(this).trigger(this.EVENT_TOUCHSTART);
        // e.preventDefault();
        this.touchMoveOffset    = 0;
        this.isTouch            = true;
        this.t_startP           = this.getTouchInfo(e);
        this.startRender();
        this.config.touchStart();
    }

    Scroll.prototype.onTouchMove = function(e){
        if(this.config.screenFix)e.preventDefault();
        this.offset     = 0;
        this.t_moveP    = this.getTouchInfo(e);
        this.touchMoveOffset = this.t_startP.y - this.t_moveP.y
        this.config.touchMove(this.touchMoveOffset);
    }

    Scroll.prototype.onTouchEnd = function(e){
        this.isTouch = false;
        this.t_moveP.time = new Date().getTime();

        var speed = (this.touchMoveOffset)/(this.t_startP.time - this.t_moveP.time);
        this.offset = -this.config.touchSpeed*speed;
        this.startRender();
        this.config.touchEnd();
    }


    Scroll.prototype.getTouchInfo = function(e){
        if(!this.time)this.time = new Date();
        var info = { x : 0 , y : 0 , time: new Date().getTime()};
        $.extend(info,getPagePos(e));
        return info;
    }


    var r       = navigator.userAgent.toLowerCase(),
        isLtIE9 = false;
    if (/msie\s(\d+)/.test(r)) {
        n = RegExp.$1;
        n *= 1;
        isLtIE9 = n < 9
    }

    var scrollAvailble = true,
        scrollOverCount = 0,
        time = new Date().getTime();
    Scroll.prototype.onWheel = function(event, delta, deltaX, deltaY){
        scrollOverCount++;
        var del;
        if(isLtIE9){
            del = isLtIE9?delta:deltaY;
        }else{
            switch(this.config.scrollType){
                case "x" : del = deltaX; break;
                case "y" : del = deltaY; break;
            }
        }
        if(Math.abs(this.offset)<=this.config.scrollLimit){
            if(scrollAvailble){
                if(del > 0){
                    this.offset -= this.config.speed;

                }else if(del < 0){
                    this.offset += this.config.speed;
                }
            }
        }else{
            // scrollOverCount++;
        }


        
        this.startRender();
    }

    /* *********************************************************
    *  Rendering
    ********************************************************** */
    Scroll.prototype.startRender = function(){
        if(typeof this.renderingID == 'undefined'){
            // this.event_dispatch(this.EVENT_SCROLLSTART);
            this.config.start();
            this.renderingID = requestAnimationFrame(this.onRender);
        }
    }

    Scroll.prototype.stopRender = function(){
        this.config.stop();
        cancelAnimationFrame(this.renderingID);
        this.renderingID = undefined;
        this.offset = 0;
    }

    Scroll.prototype.onRender = function(){
        if(Math.abs(this.offset) < 0.001){
            this.stopRender();
            this.config.step(this.offset);
            // this.event_dispatch(this.EVENT_SCROLLAFTER);
            return;
        }

        this.offset *= this.config.friction;
        this.config.step(this.offset);
        if(this.config.stats)this.stats();
        this.renderingID = requestAnimationFrame(this.onRender);
    }


    /* ************************************************************
        stats
    ************************************************************ */
    Scroll.prototype.stats = function(){
        this.offsetMax = Math.max(this.offsetMax,this.offset);
        this.offsetMin = Math.min(this.offsetMin,this.offset);

        if(typeof this.scrollStatus == 'undefined'){
            this.scrollStatus = $("<div id='scrollStatus'></div>").prependTo($('body'));
            this.scrollStatus.css({
                'position' : 'absolute',
                'z-index': 1000000,
                'padding': 10,
                'font-size' : 10,
                'font-weight' : 300,
                'text-transform' : 'uppercase',
                'background-color' : 'rgba(0,0,0,0.8)',
                'color' : '#fff',
                'width' : 200,
                'letter-spacing' : '0.02em',
                'line-height' : '1.7em',
                'font-family' : 'Helvetica'
            })
        }

        this.scrollStatus.html(
            "scroll type = " + this.config.scrollType + "<br>" +
            "scroll offset = " + this.offset.toFixed(2) + "<br>"+
            "scroll offsetMin = " + this.offsetMin.toFixed(2) + "<br>"+
            "scroll offsetMax = " + this.offsetMax.toFixed(2) + "<br>"+
            "scroll availble = " + scrollAvailble + "<br>"+
            "scroll overCount = " + scrollOverCount
            
            
        )
    }
    

    this.Scroll = Scroll;
}).apply(window);
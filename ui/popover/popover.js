steal('can/util/function',
	  'can/construct/super',
	  'can/control',
	  'can/control/plugin', 
	  'can/control/modifier',
	  'can/view/ejs',
	  'can/view/modifiers',
	  'canui/positionable',
	  './popover.less',
	  './views/init.ejs',
function() {

can.Control("Popover",{
	defaults:{
		// how to position the popover - top | bottom | left | right
		placement: 'top',

		// X/Y offset to apply to positioning
		offset: undefined,

		// The milliseconds to which the popover will hide after shown.
		hideDelay: false,

		// The milliseconds to which the popover will shown after triggered.
		showDelay: 100,

		// Delay showing and hiding the popover (ms) -
		mouseLeaveDelay: 500,

		// Popover is interactable versus hiding
		mouseable: true,

		// If a selector is provided, tooltip objects will be 
		// delegated to the specified targets.
		selector: false,

		// Event to trigger `show`
		showEvent: 'mouseenter',

		// Event to trigger `hide`
		hideEvent: 'mouseleave',

		// Template for the popover
		template: 'views/init.ejs',

		// Header to be displayed, optinal
		title: undefined,

		// Content to be displayed
		content: undefined
	},
	positions: {
		top : {
			my: "bottom",
			at: "top"
		},
		left : {
			my: "right",
			at: "left"
		},
		right : {
			my: "left",
			at: "right"
		},
		bottom : {
			my: "top",
			at: "bottom"
		}
	}
},{

	setup:function(el,options){
		options = $.extend( this.constructor.defaults, options || {} );
		options.popover = $(can.view.render(options.template, {})).appendTo(el);

		if(!options.selector){
			options.selector = el;
			el = options.popover;
		}

		this._super(el, options);
	},

	init:function(){
		this.positionable = new can.ui.Positionable(this.options.popover, 
			can.extend(this.constructor.positions[this.options.placement], 
				{ offset: this.options.offset }));
	},

	update:function(options){
		if(options.offset){
			this.positionable.update({ offset: options.offset })
		}

		if(options.placement){
			this.positionable.update(this.constructor.positions[options.placement])
		}
		
		if(options.my){
			this.positionable.update({ my: options.my })
		}
		
		if(options.at){
			this.positionable.update({ at: options.at })
		}

		if(options.title !== undefined){
			if(options.title){
				this.options.popover.find('.popover-title').html(options.title).show();
			} else {
				this.options.popover.find('.popover-title').hide();
			}
		}

		if(options.content){
			this.options.popover.find('.popover-content').html(options.content);
		}

		this._super(options);

		return this;
	},

	attr:function (elm, attr) {
		return this.options[attr] || elm.attr('data-' + attr);
	},

	// =============================== Visibility ===============================

	show:function(elm, event){
		clearTimeout(this.hideTimeout);
		this.showTimeout = setTimeout(this.proxy(function(){	

			// update dom and reposition
			this.options.popover.find('.popover-title').html(this.attr(elm, 'title'));
			this.options.popover.find('.popover-content').html(this.attr(elm, 'content'));
			this.options.popover.fadeIn('fast').trigger('move', elm);

			// detect if we flipped it and adjust css classes
			// we have to run this everytime to make sure we
			// get reset after a movement.
			var flipped = this.options.popover.attr('class').match(/\bui-flipped-\S+/g),
				position = flipped ? flipped[0].replace('ui-flipped-', '') : this.options.placement;

			this.options.popover.removeClass(function (index, css) {
	    		return (css.match(/\bpos-\S+/g) || []).join(' ');
			}).addClass("pos-" + position);

			// trigger events
			this.options.popover.trigger('shown');
		}), this.options.showDelay);

		return this;
	},

	hide:function(time){
		clearTimeout(this.showTimeout);
		this.hideTimeout = setTimeout(this.proxy(function(){
			this.options.popover.fadeOut('fast').trigger('hidden');
		}), arguments.length === 1 && time !== undefined ? time : this.options.hideDelay);

		return this;
	},

	// =============================== Events ===============================

	"{selector} {showEvent}": "show",

	"{selector} {hideEvent}": "hide",

	"{popover} mouseenter": function(elm, ev) {
		if(this.options.mouseable){
			clearTimeout(this.timeout);
		}
	},

	"{popover} mousemove": function(elm, ev) {
		if(this.options.mouseable){
			clearTimeout(this.timeout);
		}
	},

	"{popover} mouseleave": function(elm, ev) {
		this.hide(this.options.mouseLeaveDelay);
	},

	"{window} resize:debounce(100)": function(elm,ev){
		this.options.popover.triggerHandler('move', elm);
	}

});

});
steal('can/util/function',
	  'can/construct/super',
	  'can/control',
	  'can/control/plugin', 
	  'can/control/modifier',
	  'canui/positionable')
.then('./tooltip.less')
.then(function() {

can.Control("Tooltip",{
	defaults:{
		placement: 'top',
		title: undefined,
		showDelay: 100,
		hideDelay: 100,
		showEvent: 'mouseenter',
		hideEvent: 'mouseleave',
		offset: undefined,
		collision: 'flip',
		template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
		selector: false
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
		options.tooltip = $(options.template).appendTo(el);

		if(!options.selector){
			options.selector = el;
			el = options.tooltip;
		}

		this._super(el, options);
	},

	init:function(){
		this.positionable = new can.ui.Positionable(this.options.tooltip, 
			can.extend(this.constructor.positions[this.options.placement], 
				{ offset: this.options.offset,
				  collision: this.options.collision }));
	},

	update:function(options){
		if(options.offset){
			this.positionable.update({ offset: options.offset })
		}

		if(options.collision){
			this.positionable.update({ collision: options.collision })
		}

		if(options.placement){
			this.positionable.update(this.constructor.positions[options.placement])
		}

		if(options.title){
			this.options.tooltip.find('.tooltip-inner').html(options.title);
		}

		this.moved();

		this._super.apply(this, arguments);

		return this;
	},

	attr:function (elm, attr) {
		return this.options[attr] || elm.attr('data-' + attr);
	},

	// =============================== Visibility ===============================

	show:function(elm, event){
		clearTimeout(this.hideTimeout);
		this.showTimeout = setTimeout(this.proxy(function(){	
			this.options.tooltip.find('.tooltip-inner').html(this.attr(elm, 'title'));

			// move item
			this.options.tooltip.fadeIn('fast').trigger('move', elm || event);

			// detect if we flipped it and adjust css classes
			// we have to run this everytime to make sure we
			// get reset after a movement.
			var flipped = this.options.tooltip.attr('class').match(/\bui-flipped-\S+/g),
				position = flipped ? flipped[0].replace('ui-flipped-', '') : this.attr(elm, 'placement');

			this.options.tooltip.removeClass(function (index, css) {
	    		return (css.match(/\bpos-\S+/g) || []).join(' ');
			}).addClass("pos-" + position);

			// trigger events
			this.options.tooltip.trigger('shown');
		}), this.options.showDelay);
	},

	hide:function(elm,event){	
		clearTimeout(this.showTimeout);
		this.hideTimeout = setTimeout(this.proxy(function(){
			this.options.tooltip.fadeOut('fast').trigger('hidden');
		}), this.options.hideDelay);
	},

	moved:function(){
		this.options.tooltip.triggerHandler('move', this.options.selector);
	},

	// =============================== Events ===============================

	"{selector} {showEvent}": "show",

	"{selector} {hideEvent}": "hide",

	"{window} resize:debounce(100)": "moved"

});

});
steal('can/util/function',
	  'can/construct/super',
	  'can/control',
	  'can/control/plugin',
	  'can/view/ejs',
	  'can/view/modifiers',
	  'jquery/event/drag',
	  'jquery/event/drag/limit',
	  'ui/positionable',
	  './modal.less',
function(){

// private members
var backdrop;

can.Control('Modal', {
	defaults:{
		width: '560px',
		height: 'auto',
		animated: false,
		backdrop: true,
		of: undefined,
		header: undefined,
		closeButton: true,
		drag: true,
		cssClass: '',
		destroyOnHide: false
	}
},{

	setup:function(el,options){
		options = $.extend( this.constructor.defaults, options || {} );

		// wrap in content div
		$(el).wrap('<div />');
		var content = $(el).parent();
		content.addClass('modal-body');

		// wrap in outer wrapper
		content.wrap('<div />');
		var wrapper = content.parent();
		options.animated && (options.cssClass += ' animated');
		wrapper.addClass('modal ' + options.cssClass)
			   .attr('tabindex', '-1')
			   .width(options.width)
			   .height(options.height);

		// append header
		var header = $('<div>').prependTo(wrapper);
		header.addClass((options.drag ? 'draggable ' : '') + 'modal-header clearfix');

		if(options.header){
			$('<h3>').appendTo(header).html(options.header);
		}

		if(options.closeButton){
			header.append('<button type="button" class="close">×</button>');
		}

		this._super(wrapper, options);
	},

	init:function(){
		new can.ui.Positionable(this.element, {
 			my: "center center",
			at: "center center",
 			keep: false,
 			of: this.options.of
 		});
	},

	// =============================== API ===============================

	show:function(){
		this.element.show().trigger('move');

		// Animate modal and backdrop
		if(this.options.animated){
			this.element.addClass('zoomin');

			// Add backdrop and add/remove classes to show modal
			if(this.options.backdrop){
				this.backdrop = $('<div class="modal-backdrop" />').appendTo(this.options.of || document.body);
				this.backdrop.fadeIn(this.proxy(function(){
					setTimeout(this.proxy(function(){
				        this.element.addClass('window-container-visible');
				        setTimeout(this.proxy(function(){
							this.element.removeClass('animated');
				        }), 500)
					}), 100);
				}));
			} else {
				// No backdrop, just animate modal
				setTimeout(this.proxy(function(){
			        this.element.addClass('window-container-visible');
			        setTimeout(this.proxy(function(){
						this.element.removeClass('animated');
			        }), 500)
				}), 500);
			}
		} else {
			this.element.addClass('window-container-visible');
		}

		if(this.options.backdrop){
			backdrop = $('<div class="modal-backdrop" />').appendTo(this.options.of || document.body);
			backdrop.show();
		}

		this.element.trigger('shown');
	},

	hide:function(){
		this.element.hide();

		// Backdrops are inserted each time no matter what...
		backdrop && backdrop.remove();

		this.element.trigger('hidden');

		// If we destroy on hide, remove the element...
		if(this.options.destroyOnHide){
			this.element.remove();
		}
	},

	// =============================== EVENTS ===============================

	" show": "show",

	".modal-header .close click": "hide",

	" hide": "hide",

	" keydown:(esc)": "hide",

	"{window} resize:debounce(50)":function(){
		this.element.triggerHandler('move');
	},

	".draggable draginit":function(elm,event,drag){
		if(this.options.of){
			drag.limit($(this.options.of));
		}

		// drag this.element rather than the 'draggable' item
		drag.representative(this.element, 
							drag.event.originalEvent.offsetX, 
							drag.event.originalEvent.offsetY);

		drag.noSelection(document.body);
	}

});

});

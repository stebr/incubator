steal('can/util/function',
	  'can/construct/super',
	  'can/control',
	  'can/control/plugin',
	  'mj/util/key.js',
	  'can/view/ejs',
	  'can/view/modifiers',
	  'jquery/event/drag',
	  'jquery/event/drag/limit',
	  'canui/positionable',
	  './modal.less',
	  './views/init.ejs',
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
		header: '',
		closeButton: true,
		drag: true,
		destroyOnHide: false,
		template: 'views/init.ejs'
	}
},{

	setup:function(el,options){
		options = $.extend( this.constructor.defaults, options || {} );

		$(el).replaceWith(function(){
			return el = $(can.view.render(options.template, 
				can.extend(options, { content: $(this).outerHTML() }) ));
		});

		this._super(el, options);
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

	" dragdown":function(elm,event,drag){
		if(!this.options.drag || !$(event.target).hasClass('draggable')){
			drag.cancel();
		}

		if(this.options.of){
			drag.limit($(this.options.of));
		}
		
		drag.noSelection(document.body);
	}

});

/**
 * jQuery plugin for `outerHTML` due to lack of support in
 * older Firefox browsers (<16).
 */
$.fn.outerHTML = function() {
	var el = $(this);
    if (el.attr('outerHTML')) {
        return el.attr('outerHTML');
    } else {
    	var content = el.wrap('<div></div>').parent().html();
        el.unwrap();
        return content;
    }
};

});
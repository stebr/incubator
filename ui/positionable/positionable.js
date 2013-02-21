steal('jquery', 
	  'can/util/function',
	  'can/control',
	  'can/construct/proxy',
	  'can/construct/super',
	  'can/control/plugin',
	  'can/control/modifier',
	  './position.js',
function(){

can.Control("Positionable",{
 	defaults : {
		of: window,
		keep : false,
		collision: "flip",
		offset: {}
 	}
 },{

	init : function(element, options) {
		this.element.css("position", "absolute");

		if(!this.options.keep){
			// Remove element from it's parent only if this element _has_ parent.
			// This allows us to call positionable like `new can.ui.layout.Positionable($('<div/>'))
			if(this.element[0].parentNode){
				this.element[0].parentNode.removeChild(this.element[0])
			}

			document.body.appendChild(this.element[0]);				
		}
	},

	"{of} move": "move",

	move: function(el, ev, position) {
		// only allow nodes or events
		if(!position || position.nodeName || position.preventDefault){
			this.position.apply(this, arguments);
		}
	},

	using:function(coords, feedback){
		if(feedback){

			// apply offset if we have one before
			// we position the element
			var offset = this.options.offset;
			if(offset){
				offset.left && (coords.left = coords.left + offset.left);
				offset.top && (coords.top = coords.top + offset.top);
			}

			this.element.removeClass(function (index, css) {
				return (css.match (/\bpos-\w+/g) || []).join(' ');
			}).addClass('pos-' + feedback.vertical)
			.addClass('pos-' + feedback.horizontal)
			.css(coords);
		}  
	},

	position : function(el, ev, position){
		// Extend the options and set pointer to user
		var options  = can.extend(true, {}, this.options);

		// add pointer to 'using'
		options.using = this.proxy('using');

		// Set 'of' to elemenet passed in other back to defaults
		options.of = position || options.of;

		return this.element.position(options);
	}

});

});
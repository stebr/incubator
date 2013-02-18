steal('can/construct/super',
	  'can/control', 
	  'can/control/plugin', 
	  'can/view/ejs',
	  'can/view/modifiers',
	  'can/observe/compute',
	  './color', 
	  './alpha', 
	  './spectrum', 
	  './position', 
	  './gradient',
	  './advanced.less',
	  './views/advanced.ejs',
function(){

can.Control('ColorPicker',{
	defaults:{
		// can be compute or string
		hex : new can.compute()
	}
},{

	setup:function(el,options){
		options = $.extend( this.constructor.defaults, options || {} );

		var hex = options.hex;
		if(typeof hex === "function"){
			hex = hex() || '';
		}
		options.color = new Color(hex);

		this._super($('<div />').appendTo(el), options);
	},

	init:function(){
		this.element.append('views/init.ejs', this.options);
	},

	// =============================== Events ===============================


	"input:not([name=hex]) change": function(elm, e) {
		e.preventDefault();

		this.options.color.attr({
			r: this.element.find('input[name=r]').val(),
			g: this.element.find('input[name=g]').val(),
			b: this.element.find('input[name=b]').val(),
			a: parseFloat(this.element.find('input[name=a]').val()) / 100
		});
	},

	"input[name=hex] blur": function(elm, e) {
		e.preventDefault();
		var color = elm.val();

		if(/^#[0-9A-F]{6}$/i.test(color)){
			this.options.color.attr(tinycolor(color).toRgb());
		} else {
			alert('Not a valid HEX color');
		}
	},

	"[data-type=save] click": function(elm,e){
		e.preventDefault();
		var color = this.options.color;

		// update the hex
		if(typeof this.options.hex === "function"){
			this.options.hex(color.toHex());
		} else {
			this.options.hex = color.toHex();
		}

		this.element.trigger('changed', color);
	}

});

});
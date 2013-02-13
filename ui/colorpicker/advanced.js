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

var original;

can.Control('ColorPicker',{
	defaults:{
		val : new can.compute(),
		color: new Color({
			r: 255,
			g: 0,
			b: 0
		})
	}
},{

	setup:function(el,options){
		this._super($('<div />').appendTo(el), options);
	},

	init:function(){
		// Make our compute into a 'Color'
		if(this.options.val()){
			this.options.color = new Color(this.options.val())
			this.on();
		}

		// Make reference to old color in case of cancel
		original = this.options.color.clone();

		this.element.append('views/advanced.ejs', this.options);

		// Cache selectors
		this.$ = {
			r: this.element.find('input[name=r]'),
			g: this.element.find('input[name=g]'),
			b: this.element.find('input[name=b]'),
			a: this.element.find('input[name=a]'),
			preview: this.element.find('.preview .inner'),
			original: this.element.find('.preview .original'),
			hex: this.element.find('input[name=hex]')
		};

		if (original) {
			this.$.original.css({
				background: original.toString()
			});
		}

		// Setup controls
		var gradient = new Gradient(this.element.find('.gradient'), this.options);
		var spectrum = new Spectrum(this.element.find('.spectrum'), this.options);
		var alpha = new Alpha(this.element.find('.alpha'), this.options);

		this.update();
	},

	update:function(){
		this.$.hex.val(this.options.color.toHex());
		this.$.preview.css({
			background: this.options.color.toString()
		});

		this.$.r.val(this.options.color.attr('r'))
		this.$.g.val(this.options.color.attr('g'))
		this.$.b.val(this.options.color.attr('b'))
		this.$.a.val(this.options.color.attr('a'))
	},

	change: function(color) {
		if (color == null) {
			color = this.options.color;
		}

		// update hex
		if(this.options.val){
			this.options.val(color.toHex().substr(1))
		}

		this.element.trigger('changed', color);
	},

	// =============================== Events ===============================

	"{color} change": "update",

	"input:not([name=hex]) change": function(elm, e) {
		e.preventDefault();

		this.options.color.attr({
			r: this.$.r.val(),
			g: this.$.g.val(),
			b: this.$.b.val(),
			a: parseFloat(this.$.a.val()) / 100
		});
	},

	"input[name=hex] keyup": function(elm, e) {
		e.preventDefault();

		var color = this.$.hex.val();

		if(/^#[0-9A-F]{6}$/i.test(color)){
			this.options.color.attr(tinycolor(color).toRgb());
		} else {
			alert('Not a valid HEX color');
		}
	},

	"[data-type=save] click": function(elm,e){
		e.preventDefault();
		this.change();
	},

	"[data-type=cancel] click": function(elm,e){
		e.preventDefault();
		this.change(original);
	}

});

});
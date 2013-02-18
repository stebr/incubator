steal('can/observe',
	  'can/construct/super',
	  './tinycolor', 
function(){

can.Observe('Color',{

	white:function(alpha) {
		return new Color({
			r: 255,
			g: 255,
			b: 255,
			a: alpha
		});
	},

	black:function(alpha) {
		return new Color({
			r: 0,
			g: 0,
			b: 0,
			a: alpha
		});
	},

	transparent:function() {
		return new Color();
    }

},{

	init:function(rgb) {
		// defaults
		rgb || (rgb = {
			r: 255,
			g: 0,
			b: 0
		});

		this.attr(tinycolor(rgb).toRgb());
    },

    toString : new can.compute(function() {
    	if ((this.attr('a') != null) && this.a !== 1) {
    		return "rgba(" + this.attr('r') + ", " + 
    						 this.attr('g') + ", " + 
    						 this.attr('b') + ", " + 
    						 this.attr('a') + ")";
    	} else {
    		return "#" + this.toHex();
    	}
    }),

	hex: new can.compute(function(){
		return this.toHex()
	}),

	attr:function(attr, val){
		if(typeof attr === "object"){
			if (attr.r != null) {
				attr.r = parseInt(attr.r, 10);
	    	}

	    	if (attr.g != null) {
	    		attr.g = parseInt(attr.g, 10);
	    	}

	    	if (attr.b != null) {
	    		attr.b = parseInt(attr.b, 10);
	    	}

	    	if(attr.a != null){
	    		attr.a = parseFloat(attr.a);
	    	} else {
	    		attr.a = this.a || 1;
	    	}
		}

		return this._super(attr, val);
	},

    tinycolor: function() {
		return tinycolor({
			r: this.attr('r'),
			g: this.attr('g'),
			b: this.attr('b'),
			a: this.attr('a')
		});
	},

    toHex:function() {
		return this.tinycolor().toHex().toUpperCase();
    },

	toHSV: function() {
		return this.tinycolor().toHsv();
	},

	toHSL: function() {
    	return this.tinycolor().toHsl();
    },

    toRGB: function() {
    	return result = {
    		r: this.attr('r'),
    		g: this.attr('g'),
    		b: this.attr('b')
    	};
    },

    toRGBA: function() {
    	return result = {
    		r: this.attr('r'),
    		g: this.attr('g'),
    		b: this.attr('b'),
    		a: this.attr('a')
    	};
    },

    toPure: function() {
    	var h = this.tinycolor().toHsl().h;
    	var pure = tinycolor({
    		h: h,
    		s: 100,
    		l: 50
    	}).toRgb();

    	return new Color({
    		r: pure.r,
    		g: pure.g,
    		b: pure.b
    	});
    },

    isTransparent: function() {
    	return !this.attr('a');
    },

    clone: function(rgb) {
    	return new Color(can.extend(this.toRGB(), rgb));
    }
})

});
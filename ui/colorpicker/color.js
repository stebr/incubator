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
		this.set(tinycolor(rgb).toRgb())
    },

    tinycolor: function() {
		return tinycolor({
			r: this.r,
			g: this.g,
			b: this.b,
			a: this.a
		});
	},

    toHex:function() {
		return '#' + this.tinycolor().toHex().toUpperCase();
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

    set: function(rgb) {
    	if (rgb.r != null) {
    		this.attr('r', parseInt(rgb.r, 10));
    	}

    	if (rgb.g != null) {
    		this.attr('g', parseInt(rgb.g, 10));
    	}

    	if (rgb.b != null) {
    		this.attr('b', parseInt(rgb.b, 10));
    	}

    	if (rgb.a != null) {
    		this.attr('a', parseFloat(rgb.a));
    	}

    	if (isNaN(this.a)) {
    		this.attr('a', 1);
    	}

    	return this;
    },

    clone: function(rgb) {
    	return new Color(can.extend(this.toRGB(), rgb));
    },

    toString: function() {
    	if ((this.a != null) && this.a !== 1) {
    		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    	} else {
    		return this.toHex();
    	}
    }
})

});
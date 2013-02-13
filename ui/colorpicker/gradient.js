steal('./canvas', './position', function(){

Canvas('Gradient',{
	defaults:{
		width: 250,
		height: 215,
		color: Color.black()
	}
},{

	renderGradient: function() {
		var color, colors, gradient, index, xy, _i, _len, _ref, _ref1,  __slice = [].slice;

		xy = arguments[0], colors = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		gradient = (_ref = this.ctx).createLinearGradient.apply(_ref, [0, 0].concat(__slice.call(xy)));
		gradient.addColorStop(0, (_ref1 = colors.shift()) != null ? _ref1.toString() : void 0);

		for (index = _i = 0, _len = colors.length; _i < _len; index = ++_i) {
			color = colors[index];
			gradient.addColorStop(index + 1 / colors.length, color.toString());
		}

		this.ctx.fillStyle = gradient;

		return this.ctx.fillRect(0, 0, this.options.width, this.options.height);
	},

	render: function() {
		this.ctx.clearRect(0, 0, this.options.width, this.options.height);
		this.renderGradient([this.options.width, 0], Color.white(), Color.white());
		var pure = this.options.color.toPure();

		this.renderGradient([this.options.width, 0], pure.clone({ a: 0 }), pure.clone({ a: 1 }));

		var gradient = this.ctx.createLinearGradient(0, 0, -6, this.options.height);
		gradient.addColorStop(0, Color.black(0).toString());
		gradient.addColorStop(1, Color.black(1).toString());

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.options.width, this.options.height);
	},

	getCoords: function(color) {
		if (color == null) {
			color = this.options.color;
		}

		var hsv = color.toHSV();

		return result = {
			left: Math.round(this.options.width * hsv.s),
			top: Math.round(this.options.height * (1 - hsv.v))
		};
	},

	over:function(e) {
		this._super.apply(this, arguments);
		this.position.move(this.getCoords());
    }

})

});
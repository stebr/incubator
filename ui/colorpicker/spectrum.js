steal('./canvas', function(){

Canvas('Spectrum',{
	defaults:{
		width: 25,
		height: 221,
		color: undefined
	}
},{

	render: function() {
		this.ctx.clearRect(0, 0, this.options.width, this.options.height);

		var gradient = this.ctx.createLinearGradient(0, 0, 0, this.options.height);
		gradient.addColorStop(0, 'rgb(255,   0,   0)');
		gradient.addColorStop(0.16, 'rgb(255,   0, 255)');
		gradient.addColorStop(0.33, 'rgb(0,     0, 255)');
		gradient.addColorStop(0.50, 'rgb(0,   255, 255)');
		gradient.addColorStop(0.67, 'rgb(0,   255,   0)');
		gradient.addColorStop(0.83, 'rgb(255, 255,   0)');
		gradient.addColorStop(1, 'rgb(255,   0,   0)');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.options.width, this.options.height);
	},

	getCoords: function(color) {
		if (color == null) {
			color = this.options.color;
		}

		var hsv = color.toHSV();
		return result = {
			left: 0,
			top: Math.round(this.options.height * (1 - hsv.h / 360))
		};
	}

});

});
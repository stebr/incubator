steal('./canvas', './color', function(){

Canvas('Alpha',{
	defaults:{
		width: 25,
		height: 215,
		color: Color.black()
	}
},{
	render: function() {
		this.ctx.clearRect(0, 0, this.options.width, this.options.height);

		var gradient = this.ctx.createLinearGradient(0, 0, 0, this.options.height);
		gradient.addColorStop(0, this.options.color.clone({ a: 0 }).toString());
		gradient.addColorStop(1, this.options.color.clone({ a: 1 }).toString());

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.options.width, this.options.height);
	},

	val: function(x, y) {
		var data = this.ctx.getImageData(x, y, 1, 1).data;

		this.options.color.attr({
			a: Math.round((data[3] / 255) * 100) / 100
		});

		this.position.move(this.getCoords());
	},

	getCoords: function(color) {
		if (color == null) {
			color = this.options.color;
		}

		return result = {
			left: 0,
			top: Math.round(color.a * this.options.height)
		};
	}

})

});
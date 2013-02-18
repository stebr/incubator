steal('can/control', 
	  'can/construct/super',
	  './color', 
function(){
can.Control('Canvas',{

	init:function(){
		this.canvas = $('<canvas />');

		this.canvas.attr({
			width: this.options.width,
			height: this.options.height
		});

		this.canvas.css({
			width: this.options.width,
			height: this.options.height
		});

		this.ctx = this.canvas[0].getContext('2d');
		this.element.append(this.canvas);

		this.position = new Position(this.element);
		this.render();
		this.position.move(this.getCoords());
	},

	val:function(x, y){
		var data = this.ctx.getImageData(x, y, 1, 1).data;

		this.options.color.attr({
			r: data[0],
			g: data[1],
			b: data[2]
		});

		this.position.move(this.getCoords());
	},

	"canvas mousedown":function(elm, ev){
		this.mousedown = true;
		this.over(ev); 
	},

	"canvas mousemove":function(elm,ev){
		if(this.mousedown){
			this.over(ev);
		}
	},

	"{window} mouseup":function(elm,ev){
		this.mousedown = false;
	},

	over:function(e) {
		e.preventDefault();

		var offset = this.canvas.offset(),
			x, y;

		x = e.pageX - offset.left;
		y = e.pageY - offset.top;

		this.val(x, y);
    },

    "{color} change":function(Color, ev, color){
		this.render();
	}

})

})
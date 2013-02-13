steal('can/construct/super', 'can/control', function(){

can.Control('Position',{

	setup:function(el,options){
		var div = $('<div />').appendTo(el);
		this._super(div, options);
	},

	init:function(){
		this.element.css({
        	position: 'absolute'
      	});
	},

	move: function(coords) {
		return this.element.css(coords);
    }

});

});
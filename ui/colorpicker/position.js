steal('can/construct/super', 'can/control', function(){

can.Control('Position',{

	setup:function(el,options){
		this._super($('<div />').appendTo(el), options);
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
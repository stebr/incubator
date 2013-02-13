steal('can/model', './errors', function(){

var trigger = function(eventName, args){
	$.event.trigger(eventName, args || this, this.constructor, true)
};

can.Model('Core.Model',{

	// Call into a model so you can override for 
	// different types of model
	error: function(){
		ErrorHandler.apply(this, arguments);
	},

	trigger:function(eventName, args){
		trigger.apply(this, arguments);
	}

}, {
	trigger:function(eventName, args){
		trigger.apply(this, arguments);
	}
})

});
steal('can/construct', 'can/construct/super', 'can/construct/proxy', 'can/view/mustache', function(){


	// Same as `if` but if expression is function it will be 
	// executed first, and result will be used for the conditional
	Mustache.registerHelper('when', function(expr, options){
		expr = can.isFunction(expr) ? expr() : expr;
		if (!!expr) {
			return options.fn(this);
		}
		else {
			return options.inverse(this);
		}
	})

	// Call presenter function, but allow passing
	// arguments to it. Since all presenter functions
	// are explicitely bound to the presenter context
	// this allows functions to act as helpers but
	// keep their context.
	Mustache.registerHelper('&', function(fn){
		var args = can.makeArray(arguments);
		args.shift();
		return fn.apply(null, args);
	})

	var proxy = function(self, fn){
		return function(){
			return fn.apply(self, arguments);
		}
	}

	var reserved = ['setup', 'render', 'context'];

	var Present = can.Construct({
		extend : function(view, instance){
			var instanceFunctions = [];

			instance = instance || {};

			can.each(instance, function(fn, key){
				if(can.isFunction(fn)){
					instanceFunctions.push(key)
				}
			})

			return this._super({
				view              : view,
				instanceFunctions : instanceFunctions
			}, instance);
		}
	}, {
		setup : function(context){
			var self     = this;
			this.context = context;

			can.each(context, function(val, key){
				// create getters automatically
				if(typeof self[key] === "undefined"){
					self[key] = self.context[key];
				}
			});
			// bind, bind everything to this
			can.each(this.constructor.instanceFunctions, function(key){
				if(reserved.indexOf(key) === -1){
					self[key] = proxy(self, self[key])
				}
			});
		},
		render : function(){
			return this.constructor.view(this, this.helpers || {});
		}
	})

	return Present;
})
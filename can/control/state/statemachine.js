steal('can/control', 'can/observe', 'can/observe/compute', function(Control, Observe){
	// ## control/state.js  
	// _Controller statemachine integration._
	

	var Statemachine = can.Construct({}, {
		init : function(controller){
			this._controller       = controller;
			this._validTransitions = controller.constructor.states;
			this._transitions      = {};
			this._prev             = "";
			this.current           = can.compute("init");
		},
		go : function(newState){
			var current     = this.current(),
				transitions = this.transitions(newState),
				args        = can.makeArray(arguments).slice(1),
				currentTransition, funcName, fn, errorState;

			if(this.valid(newState) && newState !== current){
				args.unshift(this, newState, current);

				for(var i = 0; i < transitions.length; i++){
					currentTransition = transitions[i];
					if(typeof this._transitions[currentTransition] !== 'undefined'){
						funcName = this._transitions[currentTransition];
						if(this._controller[funcName]){
							if(can.isFunction(this._controller[funcName])){
								fn = this._controller[funcName];
							} else {
								fn = this._controller[this._controller[funcName]];
							}
							fn.apply(this._controller, args);
						}
					}
				}

				this._prev    = this._current;
				this.current(newState);
			} else {
				errorState = this._transitions['error'];
				if(typeof errorState !== 'undefined'){
					this._controller[errorState](this, newState, this._prev);
				}
			}
		},
		valid : function(newState){
			var valid;
			if(typeof this._validTransitions === 'undefined'){
				return true;
			} else {
				valid = this._validTransitions[this.current()];
				if(typeof valid === 'undefined'){
					return false;
				} else if(valid === '*'){
					return true;
				} else if(valid === newState){
					return true;
				} else if(!can.isArray(valid)){
					return false;
				} else {
					return can.inArray(newState, valid) !== -1;
				}
			}
		},
		addTransition : function(transition, funcName){
			if(transition === ""){
				transition = '__any__';
			}
			this._transitions[transition.replace(/\s/g, '')] = funcName;
		},
		transitions : function(newState){
			var current = this.current();
			return [current+"->", current+"->"+newState, "->"+newState, '__any__'];
		}
	})

	can.Control.processors.state = function( el, event, transition, funcName, controller ) {

		if(typeof controller.state === 'undefined'){
			controller.state = new Statemachine(controller);
		}

		controller.state.addTransition(transition, funcName);

		return function(){
			//return controller.state.unbind();
		}

	};

	return can;
})
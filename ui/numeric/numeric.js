steal('can/util/function',
	  'can/construct/super',
	  'can/observe',
	  'can/observe/compute',
	  'can/control',
	  'can/control/plugin',
	  'can/view/ejs',
	  'can/view/modifiers',
      'can/control/key.js',
	  'jquery/event/mousehold',
      'ui/util/mousewheel.js',
      './numeric.less',
function(){

// private members
var value, 
	input,
	isCompute = false;

can.Control('Numeric', {
	pluginName: 'numeric',
    defaults:{
        min: 0, 
        max: 10000, 
        step: 1,
        val: undefined,
        format: 'n0',
        culture: Globalize.culture()
    }
},{

	setup:function(el,options){
		// wrap the input box in a div
		var div = $(el).before('<div />').prev();
		div[0].appendChild((input = $(el))[0]);
		this._super(div, options);
	},

    init:function(){
        this.element.append('views/init.ejs', this.options);

        // cache if we have a compute
        isCompute = typeof this.options.val === "function";

        // transverse the dom object for attributes and reset options
    	for(var optionName in this.options){
    		var attr = input.attr(optionName);
			attr && (this.options[optionName] = attr);
		}

		// if we have a compute, we have to call a fn to get the value
        this.val(isCompute ? this.options.val() : this.options.val);
    },

    // =============================== API ===============================

    val:function(v){
        if (arguments.length){
            v = Number(v);

            if (isNaN(v)){
            	// if its not a valid number, reset it back
                v = value;
            } else if (v > this.options.max){
            	// if we exceeded max value, reset it back
                v = this.options.max;
            } else if (v < this.options.min){
            	// if we are lower than min value, reset it back
                v = this.options.min;
            }

            // only do this on a actual change
            // otherwise your firing the change
            // event all the time for fun
            if(v != value){
            	value = v;

	            // if its a compute, reset the main
	            // value so events fire correctly.
	            if(isCompute){
	            	this.options.val(value);
	            }

	            this.element.trigger('change', value);
            }
            
        } else {
            return value;
        }
    },

    increment:function(val){
    	// do (value || 0) so if I click the up and no 
    	// value is there it will start incremementing
        this.val((value || 0) + this.options.step);
    },

    deincrement:function(val){
    	// do (value || 0) so if I click the down and no 
    	// value is there it will start decremementing
        this.val((value || 0) - this.options.step);
    },

    // =============================== Events ===============================
   
    "{val} change":function(compute, ev, val){
    	// listen for value updates on the compute
    	// to update the value correctly...
    	this.val(val);
    },

    ".up mousehold": "increment",

    ".down mousehold": "deincrement",

    "input keydown:(pageup)": "increment",

    "input keydown:(pagedown)": "deincrement",

    "input mousewheel":function(elm,ev){
    	// prevent default so the page doesn't
    	// jump while you try to move
    	ev.preventDefault();

    	if(ev.originalEvent.wheelDelta){
    		if(ev.originalEvent.wheelDelta > 0){
				this.increment();
			} else {
				this.deincrement();
			}
    	}
    },

    "input change":function(elm,ev){
    	// listen on 'change' so you catch pastes too
        this.val(elm.val());
    },

    "input keydown:([a-z])":function(elm,ev){
    	// todo: make this handle symbols too
        ev.preventDefault();
    },

	" change":function(elm,ev){
		// listen for change events on yourself to format
		// the value correctly
        input.val(Globalize.format(value, this.options.format));
	}
});

})
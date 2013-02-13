steal('jquery', 
	  'can/control', 
	  'can/construct/proxy', 
	  'can/control/plugin', 
	  'can/control/modifier/key',
function(){

// private members
var focused, 
	lastSelected,
	keying,
	mousein,
	times,
	selected;

can.Control('mj.ui.Selectable', {
	defaults:{
		selectOn: "[tabindex]",
		selectedClassName : "hover",
        activatedClassName : "active",
        multiActivate: false,
		outsideDeactivate: false,
		deactivateParent: document
	},
	pluginName : 'selectable'
}, {

	 // =============================== API ===============================
	 
	 activate : function(el, ev){
		// if we should only select one element ...
		if(!this.options.multiActivate || (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey)){
			// remove the old activated ...
			this.activated().trigger('deactivate');
			
			// activate the new one
			el.trigger("activate", el.instances ? [el.instances()] : [el]);			
		}else if(ev.ctrlKey || ev.metaKey){ 
			if(el.hasClass(this.options.activatedClassName)){
				// if we click on the same one, deactivate
				el.trigger("deactivate");
			}else{
				// otherwise add em to the list
				var activated = this.activated().add(el);
				el.trigger("activate", [ el.instances ? activated.instances() : activated ]);
			}
		}else if(ev.shiftKey){
			// Find everything between and activate
			var selectable = this.selectable(),
				found = false,
				activated = $(el).add(lastSelected);
				
			if(lastSelected && lastSelected.length && lastSelected[0] != el[0]){
				can.each(selectable, function(select, i){
					if(select ===  lastSelected[0] || select == el[0]){
						if(!found){
							found = true;
						}else{
							return false;
						}
					} else if(found) {
						activated.push(select)
					}
				});
			}

			el.trigger("activate", [ el.instances ? activated.instances() : activated ]);
		}
	},

	select : function(el, focus){
		//we are setting ...
		el = $(el);
		
		// don't need to deselect, this will be done by select event		
		// set new selected, don't set class, done by trigger
		selected = el;
		
		// if we should focus
		if(focus === true){
			el.focus()
		}
		
		//add select event
		el.trigger("select", el);
	},

	// deselects the selected
	deselect : function(){
		this.selected().trigger("deselect");
	},

	selectable:function(){
		return this.element.find(this.options.selectOn + ":visible");
	},

	activated:function(){
		return this.element.find("." + this.options.activatedClassName);
	},

	selected : function(){
		return selected && selected.hasClass(this.options.selectedClassName) ?
			selected : (selected = this.element.find("." + this.options.selectedClassName));
	},

    // =============================== EVENTS ===============================
    
    "{selectOn} click": "activate",

    "{selectOn} keydown:(↑)":function(el,ev){
    	this.selected(el.prev(this.options.selectOn), true);
    },

     "{selectOn} keydown:(←)":function(el,ev){
		this.selected(el.prev(this.options.selectOn), true);
    },

    "{selectOn} keydown:(→)":function(el,ev){
    	this.selected(el.next(this.options.selectOn), true);
    },

    "{selectOn} keydown:(↓)":function(el,ev){
    	this.selected(el.next(this.options.selectOn), true);
    },

    "{selectOn} keydown:(↩)": "activate",

    "{selectOn} keydown:":function(el,ev){
    	ev.preventDefault();

    	keying = true;
		setTimeout(function(){
			keying = false;
		}, 100)
    },

    "{selectOn} activate": function(el, ev, keys){
        // if event is synthetic (not IE native activate event)
		el.addClass(this.options.activatedClassName);
		lastSelected = el;
    },

    "{selectOn} deactivate": function(el, ev){
        // if event is synthetic (not IE native deactivate event)
        if (!ev.originalEvent) {
			el.removeClass(this.options.activatedClassName);
		}
    },

    "{selectOn} focusin": function(el, ev){
		this.selected(el, false);
		focused = el;
    },

	"{selectOn} focusout": function(el, ev){
		focused = null;
		// we are not in the element, and we are not focused on anything
		if(!mousein){
			this.deselect();
		}
    },

    "{selectOn} mouseenter": function(el, ev){
		if(!keying){
			this.selected(el, false);
		}
    },
	
	"{selectOn} mouseleave" : function(el, ev){
		if(!keying && !focused) {		
			// deselect if we haven't focused, or we are 
			// leaving something not the focused element
			//make sure it's deselected
			this.deselect();
		}
	},

    "{selectOn} select" : function(el, ev){
		var selected = this.selected.not(el);

        if (selected.length){
            selected.trigger('deselect');
        }

        el.addClass(this.options.selectedClassName);
    },

    "{selectOn} deselect": function(el, ev){
        el.removeClass(this.options.selectedClassName);
    },

    "{deactivateParent} click":function(el,ev){
		if(this.options.outsideDeactivate && 
			!$.contains(this.element[0],ev.target)){
				
			// if there's a click, keypress, or activate event 
			// outside of us ... deactivate
			var active = this.activated();
			if(active.length){
				active.trigger('deactivate');
				this.element.trigger('outsideDeactivate', [ $(ev.target) ]);
			}
		}
	}

})


});
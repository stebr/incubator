steal('can/construct',
	  'can/construct/super',
	  'can/construct/proxy',
	  'can/control',
	  'can/view/ejs',
	  './growl.less',
	  './views/growl.ejs', 
function(){

/**
 * `mj.notify` is a system for creating notifications.
 */
can.Construct("Notify", {
	defaults:{
		time: 1500,
		position: "bottom right",
		animate: 'fade',
		sticky: true,
		template: 'views/growl.ejs',
		dismissable: true
	},

	queue: [],

	counter: 0,

	init:function(options){
		this.defaults = can.extend(this.defaults, options || {});

		this.wrapper = $('<div class="notification-wrapper ' + 
			this.defaults.position.split(' ').join('-') + '" />').appendTo(document.body);
	},

	/**
	 * Adds a notification to the screen.
	 *
	 * For example:
	 * 		{
	 * 			title: "Tip",
	 * 			image: "",
	 * 			text: "Click and hold for a moment to pan."
	 * 		}
	 *
	 *	Additionally, you can pass any arguments that are
	 *	included in the defaults to override a particular 
	 *	action.
	 * 
	 * @param {[type]} note
	 */
	add: function(note){
		this.queue.push(new mj.notify.Bubble(this.wrapper, 
			can.extend(this.defaults, note || {}, { id: this.counter++ })));
	},

	/**
	 * Dismisses a single notification by `id`.
	 * @param  {Number} id
	 */
	dismiss:function(id){
		$.each(this.queue, function(bubble, i){
			if(bubble.id === id){
				bubble.dismiss();
			}
		});
	},

	/**
	 * Dismisses all notifications.
	 */
	dismissAll:function(){
		$.each(this.queue, function(bubble, i){
			bubble.dismiss();
		});
	}

},{});

/**
 * Bubbles are the notifications themselves.
 */
can.Control('Notify.Bubble',{
	setup:function(el,options){
		this.id = options.id;
		this._super($(can.view.render(options.template, options))
			.appendTo(el), options);
	},

	init:function(){
		this.element[this.options.animate + "In"]();
		this.startTimer();	
	},

	startTimer:function(){
		if(!this.options.sticky){
			this.timer = setTimeout(this.proxy('dismiss'), this.options.time);
		}
	},

	dismiss:function(){
		this.element[this.options.animate + "Out"]();
	},

	" mouseenter":function(elm,ev){
		clearTimeout(this.timer);
	},

	" mouseleave": "startTimer",

	".close click": "dismiss"
});


});
steal('jquery/event/resize', 
	  'jquery/dom/styles', function(){

// evil things we should ignore
var matches = /script|td/,
	// jquery.outerHeight is SLOW
	outerHeight = function(elm){
		var styles = $.styles(elm[0], ['paddingTop', 
									   'paddingBottom', 
									   'borderTopWidth', 
									   'borderBottomWidth', 
									   'marginTop', 
									   'marginBottom']);
		
		return elm.height() + 
				parseInt(styles.paddingTop || 0) + 
				parseInt(styles.paddingBottom || 0) + 
				parseInt(styles.borderTopWidth || 0) + 
				parseInt(styles.borderBottomWidth || 0) + 
				parseInt(styles.marginTop || 0) + 
				parseInt(styles.marginBottom || 0);
	},

/**
 *
 * # Parents
 *
 * // Default -> this.parent()
 * $('.dom').fill();
 *
 * // jQuery Selectors
 * $('.dom').fill('.myParent');
 * 
 * // DOM nodes
 * $('.dom').fill(getElementById('dom'))
 *
 * // jQuery objs
 * $('.dom').fill($('moo:eq(1)'))
 * 
 */
filler = $.fn.fill = function( parent ) {
	if(!parent){
		// default to parent
		var p = this.parent();
		parent = p[0] === document.body ? $(window) : p;
	} else if(typeof parent == 'string'){
		// find via selector
		parent = this.closest(parent)
	} else if(parent.nodeName ) {
		// wrap everything
		parent = $(parent);
	}

	this.each(function(){
		// Attach to the `resize` event
		parent.bind('resize', $(this), filler.parentResize);

		// unbind on destroy
		filler.bind('destroyed', $(this), function( ev ) {
			parent.unbind('resize', filler.parentResize)
		});
	});

	// resize to get things going
	$(parent.resize());

	return this;
};

$.extend(filler, {
	parentResize : function( ev ) {
		var fille = ev.data;

		// if the window is hidden, return and
		// stop the propagation of anymore
		//if (fille.is(':hidden')) {
		//	ev.stopPropagation();
		//	return;
		//}

		var parent = $(this),
			height = parent.height();

		// check yo cache, since we are going down if the
		// parent was resize but we get to a elm that wasn't
		// then we can stop because its not going to get the 
		// resize event.
		if(fille.data('prev') == height){
			//ev.stopPropagation();
			return;
		}

		// cache the current
		fille.data('prev', height);

		var isWindow = this == window,
			container = (isWindow ? $(document.body) : parent),
			children = container.children().filter(function() {
				if ( matches.test(this.nodeName.toLowerCase()) ) {
					return false;
				}

				// Use jquery/dom/styles for faster CSS aquistion
				// http://jsfiddle.net/donejs/6CcaG/light/
				var styles = $.styles(this, ['position', 'display']);
				return styles.position !== "absolute" && styles.position !== "fixed"
					&& styles.display !== "none" && !jQuery.expr.filters.hidden(this)
			}),
			last = children.eq(-1), cur;

		if (last.length) {
			var offsetParent = last.offsetParent()[0],
				lastOffsetTop = last[0].offsetTop,
				lastOuter = outerHeight(last);

			if(offsetParent === container[0]){
				cur = lastOffsetTop + lastOuter;
			} else if(offsetParent === container.offsetParent()[0]){
				var div = '<div style="height:0;line-height:0px;overflow:hidden;"/>',
					first = $(div).prependTo(container);	

				cur = (lastOffsetTop + lastOuter) - first[0].offsetTop;
				first.remove();
			}
		}

		// what the difference between the parent height and what we are going to take up is
		// the current height of the object
		var delta = height - cur,
			fillerHeight = fille.height();

		fille.height(fillerHeight + delta + "px")
	}
});

});
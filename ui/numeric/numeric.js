steal('can/control', function(){

/**
 * Handles numeric validation for only allowing 0-9 characters in numeric boxes.
 */
can.Control('Numeric',
{
	/**
	 * Key press on the input box.
	 * @param {Object} elm
	 * @param {Object} event
	 */
	"keyup":function(elm,event){
		var val = elm.val();
		
		if(isNaN(val)){
			val = val.replace(/[^0-9\.]/g,'');
			if(val.split('.').length > 2) {
				val =val.replace(/\.+$/,"");
			}
		}
		
		elm.val(val);
	}
});

});

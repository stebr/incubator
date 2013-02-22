# Colorpicker

Color picker control based on canvas.

	var hex = new can.compute('#FFFFFF');

	var cp = new ColorPicker("#mydiv", {
		hex: hex 
	});

	hex.bind('change', function(){
		// change happened
	});

	cp.element.bind('change' function(){
		// change happened
	});

## Options

- hex: the default color, can be compute or string
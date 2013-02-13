steal(function(){

// Register default AJAX error handler
$(document).ajaxError(Core.Model.error);

/**
 * Generic Event Error Handler
 * @param {[type]} event       [description]
 * @param {[type]} xhr         [description]
 * @param {[type]} settings    [description]
 * @param {[type]} errorThrown [description]
 */
ErrorHandler = function(event, xhr, settings, errorThrown)
{
	try {
		var response = eval('(' + xhr.responseText + ')');
		if(response){
			if(response.errors){
				//- multiple errors were given from the server...
				var msg = '';
				
				$.each(response.errors, function() { 
					msg += this.message + "<br />"; 
				});
				
				return msg;
			} else if((typeof response == "string" && response.length > 0) || (typeof response == "number")) {
				//- try to find code in error codes, otherwise throw the generic error.
				var errorMessage = false;
				
				// Find the error message
				if(ErrorHandler.codes[response]){
					errorMessage = ErrorHandler.codes[response];
				}

				// No message was found
				if (errorMessage == undefined || !errorMessage) {
					return 'An error occurred'.
				}

				return errorMessage;
			}
		}
	} catch (ex) { 
		//- Can't parse response, throw a generic error
		return 'An error occurred'.
	}
};

/**
 * Localized error codes.
 * Keyed by the 'responseText' in the XHR object.
 */
ErrorHandler.codes = [];

});
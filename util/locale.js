steal('can/construct', 
	  'can/construct/proxy',
	  'can/observe', 
	  'can/view/ejs',
	  'can/util',
	  'util/globalize',
function(){

var isProduction = steal.config().env === "production";

can.Construct('Core.Locale',{
	dicts: {},

	init:function(){
		// extend mj.Locale to have SOME of the Gloablize functions
		$.each(['findClosestCulture','addCultureInfo','localize','parseFloat','parseDate', 'format'], this.proxy(function(i,func){
			this[func] = function(){
				return Globalize[func].apply(Globalize, arguments);
			};
		}));

		this.culture.bind('change', function(ev, val){
			Core.Locale.getMessages(val);
			if(isProduction){
				Globalize.culture(val);
			}
		})
	},

	culture: new can.compute(),

	getMessages:function(val){
		var formatted = val === 'en-US' ? '' : ('_' + (val.replace('-', '_'))),
			fileName = 'l10n' + formatted + (isProduction ? '.js' : '.properties');

		// If we don't already have the localization lib in the cache
		// fetch the library.  If we are in development mode, we need 
		// to convert the key/value pairs to a JSON object so the JS
		// can read the string.
		if(!this.dicts[fileName]){
			steal({ id: 'locale/' + fileName, async: false }, this.proxy(function(){
				if(!isProduction){
					this.addCultureInfo(val, {
					    messages: this.buildMessages(this.dicts[fileName])
					});

					Globalize.culture(val);
				}
			}));
		}
	},

	buildMessages:function(keyval){
		var obj = {};
		keyval.split("\n").forEach(function(line){			
			var kv = line.split("=");
			if (kv.length > 1) {
				obj[kv[0].trim()] = kv[1].trim();
			}		
		});
		return obj;
	}

}, {});

// If we are in development mode, we need to set the `.properties`
// mime type for steal to register how to pull it down.
if(window.steal) {
	steal.type("properties text", function( options, success, error ) {
		Core.Locale.dicts[options.id.filename()] = options.text
		success();
	})
};

// String helper for formatting strings like:
// 'My foo did {0}'.format('laugh') would return 'My foo did laugh'
String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

// EJS Helper for automatic binding
can.EJS.Helpers.prototype.alz = function(key){
	if(Core.Locale.culture()) {
		return window.lz(key);
	}
};

// Localization shorthand helper.
window.lz = function(key, repl){
	var str = Core.Locale.localize(key) || "NO STRING FOUND!";
	if(arguments.length > 1){
		str = str.format(repl)
	}
	return str;
};

});
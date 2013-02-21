steal('can/control', function(){

can.Control('Password',
{
	defaults : 
	{
		shortPass:  "Too short",
		shortCss: 'short',
		longCss: 'long',
		longPass: "Too long",
		badPass: "Too Weak",
		badCss: 'bad',
		goodPass: "Good",
		goodCss: 'good',
		strongPass: "Strong",
		strongCss: 'strong',
		minPasswordLength: 8,
		maxPasswordLength: 32
	}
},{
	/**
	 * Wraps the input in a div.
	 * @param {Object} el
	 * @param {Object} options
	 */
	setup:function(el,options)
	{
		var $el = $(el);
		$el.wrap('<div class="ui-widget-password" />');
		var div = $el.parent();
		
		div.append('<div class="strength-indicator"><span class="strength"></span></div>');
	
		this._super(div, options);
	},
	
	/**
	 * Input keyup.
	 * @param {Object} elm
	 * @param {Object} event
	 */
	"input keyup" : function(elm, event)
	{
		if(elm.val() != ""){
			this.find('span.strength').text(this.validateStrength(elm.val()));
		}
	},
	
	/**
	 * Validates the password strength.  
	 * Strength algorithm based on Darren Mason (djmason9@gmail.com) 
	 * http://mypocket-technologies.com/jquery/password_strength/
	 * @param {Object} password
	 */
	validateStrength:function(password)
	{
		//- Remove old classes
		this.element.removeClass(this.options.shortCss);
		this.element.removeClass(this.options.strongCss);
		this.element.removeClass(this.options.badCss);
		this.element.removeClass(this.options.goodCss);
		this.element.removeClass(this.options.longCss);
		
		//- Too Short or too long
	    if (password.length < this.options.minPasswordLength) {
			this.element.addClass(this.options.shortCss);
			return this.options.shortPass;
		} else if(password.length > this.options.maxPasswordLength){
			this.element.addClass(this.options.longCss);
			return this.options.longPass;
		}
	    
		var score = 0; 
	
	    //password length
	    score += password.length * 4;
	    score += ( this.checkRepetition(1,password).length - password.length ) * 1;
	    score += ( this.checkRepetition(2,password).length - password.length ) * 1;
	    score += ( this.checkRepetition(3,password).length - password.length ) * 1;
	    score += ( this.checkRepetition(4,password).length - password.length ) * 1;

	    //password has 3 numbers
	    if (password.match(/(.*[0-9].*[0-9].*[0-9])/)){ score += 5;} 
	    
	    //password has 2 symbols
	    if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)){ score += 5 ;}
	    
	    //password has Upper and Lower chars
	    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)){  score += 10;} 
	    
	    //password has number and chars
	    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)){  score += 15;} 
	    //
	    //password has number and symbol
	    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)){  score += 15;} 
	    
	    //password has char and symbol
	    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)){score += 15;}
	    
	    // password is just numbers with no symbols or alphas
	    if (!password.match(/([a-zA-Z])/) ){ 
			score -= 100;
		}
		
	    // password is just alpha with no symbols or chars
		if (!password.match(/([0-9])/) ){ 
			score -= 100;
		}
		
	    //verifying 0 < score < 100
	    if ( score < 0 ){score = 0;} 
	    if ( score > 100 ){  score = 100;} 
	    
	    if (score < 34) {
			this.element.addClass(this.options.badCss);
			return this.options.badPass;
		}
	
	    if (score < 68) {
			this.element.addClass(this.options.goodCss);
			return this.options.goodPass;
		}
	    
		this.element.addClass(this.options.strongCss);
	    return this.options.strongPass;  
		},
	
	/**
	 * Checks for repetition of characters.
	 * @param {Object} pLen
	 * @param {Object} str
	 */
	checkRepetition: function(pLen,str) 
	{
	 	var res = "";
		
	     for (var i=0; i<str.length ; i++ ) 
	     {
	         var repeated=true;
	         
	         for (var j=0;j < pLen && (j+i+pLen) < str.length;j++){
	             repeated=repeated && (str.charAt(j+i)==str.charAt(j+i+pLen));
	             }
	         if (j<pLen){repeated=false;}
	         if (repeated) {
	             i+=pLen-1;
	             repeated=false;
	         }
	         else {
	             res+=str.charAt(i);
	         }
	     }
		 
	     return res;
	}
});
})
steal(
'can/util/string',
'can/component',
'./views/errors.mustache',
'./views/form_group.mustache',
'./form_for.less',
'can/construct/super'
, function(can, Component, errorsView, formGroupView){

	var FormForError = function (message){
		this.message = message;
		this.stack = (new Error()).stack;
	}

	FormForError.prototype      = new Error; 
	FormForError.prototype.name = 'FormForError'; 

	Mustache.registerHelper('errorsFor', function(attribute, opts){
		if(arguments.length < 2){
			opts = attribute;
			attribute = null;
		}

		var attr       = (can.isFunction(attribute) ? attribute() : attribute) || null,
			scope      = opts.scope,
			parentPath = scope.attr('@attrPath'),
			errors     = scope.attr('@errors')() || {},
			attrPath   = [],
			errorsFor;

		if(!parentPath && !attr){
			throw new FormForError('You must pass attribute to the `errorFor` helper')
		}

		parentPath && attrPath.push(parentPath);
		attr       && attrPath.push(attr);

		attrPath = attrPath.join('.');

		errorsFor = errors[attrPath];

		return errorsFor ? opts.fn(errorsFor) : "";
	})

	Component.extend({
		tag : 'form-group',
		template : formGroupView,
		scope : {
			'for' : '@',
			'label' : '@',
			'attrFor' : function(){
				return this.attr('for') || "";
			}
		},
		setup : function(){
			var res = this._super.apply(this, arguments);
			if(this.scope.attr('for') === null){
				this.scope.attr('for', '');
			}
			return res;
		}
	})

	Component.extend({
		tag : 'attr-errors',
		template : errorsView,
		scope : {
			'for' : '@'
		},
		setup : function(){
			var res = this._super.apply(this, arguments);
			if(this.scope.attr('for') === null){
				this.scope.attr('for', '');
			}
			return res;
		}
	})

	Component.extend({
		tag : 'attr-repeater',
		template : '{{#each for}}{{#setupCtx}}<content></content>{{/setupCtx}}{{/each}}',
		setup : function(el, opts){
			var prevAttrPath = opts.scope.attr('@attrPath'),
				attrPath     = prevAttrPath ? [prevAttrPath] : [];

			attrPath.push(el.getAttribute('for'));
			opts.scope = opts.scope.add({
				'@attrPath' : attrPath.join('.')
			});

			return this._super(el, opts)
		},
		helpers : {
			setupCtx : function(opts){
				var index = opts.scope.attr('@index')(),
					length = opts.scope.attr('for.length'),
					scope;

				scope = opts.scope.add({
					'@current'  : 'for.' + index,
					'@index1'   : index + 1,
					'@isFirst'  : (index === 0),
					'@isLast'   : (index === length - 1),
					'@attrPath' : (opts.scope.attr('@attrPath') || "") + '.' + index
				});

				return opts.fn(scope);
			}
		}
	})


	Component.extend({
		tag : 'attr-scope',
		template : '<content></content>',
		scope : function(attrs, parentScope, element){
			return attrs['for'];
		},
		setup : function(el, opts){
			var prevAttrPath = opts.scope.attr('@attrPath'),
				attrPath     = prevAttrPath ? [prevAttrPath] : [];

			attrPath.push(el.getAttribute('for'));
			opts.scope = opts.scope.add({'@attrPath' : attrPath.join('.')});

			return this._super(el, opts)
		}
	})

	return Component.extend({
		tag : 'form-for',
		template : '<form role="form"><content></content></form>',
		scope : function(attrs, parentScope, element){
			return parentScope.attr(element.getAttribute('model'));
		},
		setup : function(el, hookupOptions){
			var subtemplate  = hookupOptions.subtemplate,
				self         = this,
				passedErrors = el.getAttribute('errors'),
				res, errors;

			if(passedErrors){
				passedErrors = hookupOptions.scope.attr(passedErrors);
			}

			errors = passedErrors || can.compute(null);

			hookupOptions.scope = hookupOptions.scope.add({
				'@errors' : errors
			});
			
			res = this._super(el, hookupOptions);

			this._control._errorsRuleset = el.getAttribute('ruleset') || undefined;
			this._control._errors        = errors;

			return res;
		},

		events : {
			"{scope} change" : function(scope, ev, attr, how){
				if(!scope.errors){
					return;
				}

				var errors = scope.errors(this._errorsRuleset),
					self   = this;
				this.__changedAttrs = this.__changedAttrs || [];

				if(how === 'set' && can.inArray(attr, this.__changedAttrs) === -1){
					this.__changedAttrs.push(attr);
				}

				if(!this._validated){
					can.each(errors, function(val, k){
						if(can.inArray(k, self.__changedAttrs) === -1){
							delete errors[k];
						}
					})
				}

				errors = can.isEmptyObject(errors) ? null : errors;
				this._errors(errors ? errors : null);
			},
			" validate" : 'validateForm',
			"form submit" : function(el, ev){
				ev.preventDefault();
				this.validateForm();
			},
			validateForm : function(){
				var errors = this.scope.errors(this._errorsRuleset);
				this._validated = true;
				this._errors(errors ? errors : null);
			}
		}
	})

});
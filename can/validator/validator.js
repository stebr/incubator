steal('can', function (can){

	var ValidatorError = function (message){
		this.message = message;
		this.stack = (new Error()).stack;
	}

	ValidatorError.prototype      = new Error; 
	ValidatorError.prototype.name = 'ValidatorError'; 

	var validateTree = function (current, path, rules, rulesets, prevPath, instance){

		var currentAttr = path.shift(),
			childErrors = {},
			errors      = {},
			iterCurrent, proxyPath, nestedErrors, joinedPrevPath;

		if(currentAttr === '*'){
			if(current){
				for(var i = 0; i < current.attr('length'); i++){
					proxyPath = prevPath.slice(0);
					proxyPath.push(i);
					iterCurrent = current.attr(i);

					childErrors = validateTree(iterCurrent, path.slice(0), rules, rulesets, proxyPath, instance);
					addErrors(errors, childErrors);
				}
			}
		} else {
			current = _.isUndefined(current) ? undefined : (current.attr ? current.attr(currentAttr) : current);
			currentAttr && prevPath.push(currentAttr);

			if(_.isEmpty(path)){
				
				joinedPrevPath = prevPath.join('.');

				childErrors = _.compact(_.map(rules, function (rule){
					var error = rule.call(instance, current, joinedPrevPath);
					if(!_.isUndefined(error)){
						return error;
					}
				}));

				if(!_.isEmpty(childErrors)){
					errors[joinedPrevPath] = childErrors;
				}

			} else {

				childErrors = validateTree(current, path, rules, rulesets, prevPath, instance);

				if(!_.isEmpty(childErrors)){
					if(_.isPlainObject(childErrors)){
						addErrors(errors, childErrors);
					} else {
						errors = childErrors;
					}
				}
			}
		}

		return errors;
	}

	var addErrors = function (errors, newErrors){
		_.each(newErrors, function (e, attr){
			if(_.isUndefined(errors[attr])){
				errors[attr] = [];
			}
			errors[attr].push.apply(errors[attr], (_.isString(e) ? [e] : e));
		})
		return errors;
	}

	var Kenshou = can.Construct.extend({
		init : function (Model, rules){
			this.Model = Model;
			this.rules = {};

			rules.call(this);
		},
		addRule : function (attr, rule){
			var rulePair = can.trim(attr).split(':'),
			ruleSet  = rulePair.length === 2 ? rulePair[0] : '_default_',
			ruleAttr = rulePair.pop();

			ruleSet = (ruleSet === 'default') ? '_default_' : ruleSet;

			this.rules[ruleSet]           = this.rules[ruleSet] || {};
			this.rules[ruleSet][ruleAttr] = this.rules[ruleSet][ruleAttr] || [];
			
			this.rules[ruleSet][ruleAttr].push(this._resolveRule(rule));
		},
		
		validate : function (instance, ruleset){
			var errors   = {},
				self     = this,
				combined = this._getCombinedRules(instance.constructor, ruleset),
				attributes, treeErrors;

			_.each(combined, function (rules, attr){
				var value, attrErrors, path, current, currentAttr, attr;

				if(attr === '*') {
					value = instance;
					_.each(rules, function (rule){
						var error = rule.call(instance, value, attr);
						if(!_.isUndefined(error)){
							if(!_.isPlainObject(error)){
								throw new ValidatorError('Validators that operate on the whole object (defined with the `*`) MUST return the object with the attribute => error pairs');
							}
							errors = addErrors(errors, error);
						}
					});
				} else {
					treeErrors = validateTree(instance, attr.split('.'), rules, ruleset, [], instance);
					errors     = addErrors(errors, treeErrors);
				}
			});

			if(instance.constructor.attributes){
				attributes = instance.constructor.attributes;
				
				_.each(attributes, function (klass, attribute){
					var current = instance.attr(attribute),
						length  = current.attr('length'),
						childErrors, iterCurrent;

					if(length){
						for(var i = 0; i < length; i++){
							iterCurrent = current.attr(i);
							childErrors = iterCurrent.errors ? iterCurrent.errors(ruleset) : null;
							if(childErrors){
								addErrors(errors, _.transform(childErrors, function (result, err, key){
									var path = _.flatten([attribute, i, key]).join('.');
									result[path] = err;
								}));
							}
						}
					} else {
						childErrors = current.errors(ruleset);
						if(childErrors){
							addErrors(errors, _.transform(childErrors, function (result, err, key){
								var path = _.flatten([attribute, key]).join('.');
								result[path] = err;
							}))
						}
					}

				})
			}

			return _.isEmpty(errors) ? null : errors;
		},
		_resolveRule : function (rule){
			var resolved;
			if(can.isFunction(rule)){
				return rule;
			} else {
				resolved = Validator.rules[rule];
				if(_.isUndefined(resolved)){
					throw new ValidatorError("Rule with the name `" + rule + "` doesn't exist.");
				} else {
					return resolved();
				}
			}
		},
		_getCombinedRules : function (klass, ruleset){
			var combined = {}, 
				self     = this,
				idx;

			if(_.isUndefined(ruleset)){
				ruleset = _.keys(this.rules);
			} else if(_.isString(ruleset)){
				ruleset = ruleset.split(',');
			}

			idx = _.indexOf(ruleset, 'default');

			if(idx > -1){
				ruleset[idx] = '_default_';
			}

			_.each(ruleset, function (r){
				var rules = self.rules[r];
				_.each(rules, function (rule, attr){
					
					if(_.isUndefined(combined[attr])){
						combined[attr] = rule;
					} else {
						combined[attr].push.apply(combined[attr], rule);
					}
					
				})
			})

			return combined;
		}
	})

	var Validator = function (Model, rules){
		Model.validator = new Kenshou(Model, rules);

		Model.prototype.errors = function (ruleset){
			return this.constructor.validator.validate(this, ruleset);
		}
		Model.prototype.attrErrors = function (attr, ruleset){
			
			var errors = this.errors(ruleset),
				subset = {};

			if(_.isString(attr)){
				attr = [attr];
			}

			_.each(attr, function(a){
				if(errors[a]){
					subset[a] = errors[a];
				}
			})

			return _.isEmpty(subset) ? null : subset;
		}
		Model.prototype.isValid = function (ruleset){
			return this.errors(ruleset) === null;
		}
		Model.prototype.attrIsValid = function (attr, ruleset){
			return this.attrErrors(attr, ruleset) === null;
		}

		return Model.validator;
	}

	Validator.messages = {
		presenceOf     : "can't be empty",
		formatOf       : "is invalid",
		inclusionOf    : "is not a valid option (perhaps out of range)",
		lengthOf       : "has wrong length",
		rangeOf        : "is out of range",
		numericalityOf : "must be a number"
	}

	Validator.rules = {
		presenceOf : function (message){

			message = message || Validator.messages.presenceOf;

			return function (value, path){
				if (typeof value == 'undefined' || value === "" || value === null) {
					return message;
				}
			}
		},
		formatOf : function (regexp, message) {

			if(arguments.length < 1){
				throw new ValidatorError('Validation `formatOf` requires `regexp <RegExp>` as the first argument');
			}

			message = message || Validator.messages.formatOf;

			return function (value, path){
				var check = (typeof value !== 'undefined' && value !== null && value !== '');
				if (check && String(value).match(regexp) == null) {
					return message;
				}
			}
		},
		inclusionOf : function (inArray, message){

			if(arguments.length < 1){
				throw new ValidatorError('Validation `inclusionOf` requires `inArray <Array>` as the first argument');
			}

			message = message || Validator.messages.inclusionOf;

			return function (value, path) {
				if (typeof value == 'undefined') {
					return;
				}

				for(var i = 0; i < inArray.length; i++) {
					if(inArray[i] == value) {
						return;
					}
				}

				return message;
			}
		},
		lengthOf : function (min, max, message){

			if(arguments.length < 2){
				throw new ValidatorError('Validation `lengthOf` requires `min <Integer>` as the first and `max <Integer>` as the second arugment');
			}

			message = message || Validator.messages.lengthOf;

			return function (value, path){
				if (((typeof value === 'undefined' || value === null) && min > 0) ||
						(typeof value !== 'undefined' && value !== null && value.length < min)) {
					return message + " (min = " + min + ")";
				} else if (typeof value != 'undefined' && value !== null && value.length > max) {
					return message + " (max = " + max + ")";
				}
			}
		},
		rangeOf : function (low, hi, message){

			if(arguments.length < 2){
				throw new ValidatorError('Validation `rangeOf` requires `low <Integer>` as the first and `hi <Integer>` as the second arugment');
			}

			message = message || Validator.messages.rangeOf;

			return function (value, path){
				if (((typeof value == 'undefined' || value === null) && low > 0) ||
						(typeof value !== 'undefined' && value !== null && (value < low || value > hi) )) {
					return message + " [" + low + "," + hi + "]";
				}
			}
		},
		numericalityOf : function (message){

			message = message || Validator.messages.numericalityOf;

			return function (value, path){
				var res = !isNaN(parseFloat(value)) && isFinite(value);
				if (!res) {
					return message;
				}
			}
		}
	}

	return Validator;
})
steal('incubator/can/validator', 'can/map', 'can/map/attributes', function(Validate, Map) {
	return function() {

		module('util/kenshou')

		test('Simple validations', function() {
			var User = Map.extend({}), user;

			Validate(User, function(){
				this.addRule('name', 'presenceOf');
				this.addRule('*', function(){
					return {
						foo : 'bar'
					}
				})
			});

			user = new User;

			deepEqual(user.errors(), {
				name : ["can't be empty"],
				foo  : ['bar']
			})

		});

		test('Nested validations', function() {
			var User = Map.extend({}), user;

			Validate(User, function(){
				this.addRule('socialMedia.*.username', 'presenceOf');
				this.addRule('followers.*', 'presenceOf')
			});

			user = new User({
				socialMedia : [{
					service  : 'twitter',
					username : 'foo'
				}, {
					service  : 'github'
				}],
				followers : ['foo', 'bar', 'baz', '']
			});

			deepEqual(user.errors(), {
				'socialMedia.1.username' : ["can't be empty"],
				'followers.3' : ["can't be empty"]
			})

		});

		test('Composed validations', function(){
			var SocialMedia = Map.extend({}),
				Address = Map.extend({}),
				User = Map.extend({
					attributes : {
						socialMedia : SocialMedia,
						address : Address
					}
				}, {}),
				user;

			Validate(SocialMedia, function(){
				this.addRule('service', function(value){
					if(value !== 'github'){
						return "It's not github";
					}
				})
			})

			Validate(Address, function(){
				this.addRule('street', 'presenceOf')
			})

			Validate(User, function(){
				this.addRule('socialMedia.*.username', 'presenceOf');
				this.addRule('followers.*', 'presenceOf')
			});

			user = new User({
				socialMedia : [{
					service  : 'twitter',
					username : 'foo'
				}, {
					service  : 'github'
				}],
				followers : ['foo', 'bar', 'baz', ''],
				address : {
					city : 'Zagreb',
					street : ''
				}
			});

			deepEqual(user.errors(), {
				'socialMedia.0.service'  : ["It's not github"],
				'socialMedia.1.username' : ["can't be empty"],
				'followers.3'            : ["can't be empty"],
				"address.street"         : ["can't be empty"]
			})
		})

		test('Validations for attribute', function(){
			var SocialMedia = Map.extend({}),
				User = Map.extend({
					attributes : {
						socialMedia: SocialMedia
					}
				}, {}),
				user;

			Validate(SocialMedia, function(){
				this.addRule('service', function(value){
					if(value !== 'github'){
						return "It's not github";
					}
				})
			})

			Validate(User, function(){
				this.addRule('socialMedia.*.username', 'presenceOf');
				this.addRule('followers.*', 'presenceOf')
			});

			user = new User({
				socialMedia : [{
					service  : 'twitter',
					username : 'foo'
				}, {
					service  : 'github'
				}],
				followers : ['foo', 'bar', 'baz', '']
			});

			deepEqual(user.attrErrors('socialMedia.0.service'), {
				'socialMedia.0.service'  : ["It's not github"]
			})

			deepEqual(user.attrErrors(['socialMedia.0.service', 'socialMedia.1.username']), {
				'socialMedia.0.service'  : ["It's not github"],
				'socialMedia.1.username' : ["can't be empty"]
			})
		})

		test('Validation sets', function(){
			var User = Map.extend({}), user;

			Validate(User, function(){
				this.addRule('login:name', 'presenceOf');
				this.addRule('name', function(value, path){
					return 'name is required';
				});
				this.addRule('login:email', 'presenceOf');
			});

			user = new User;

			deepEqual(user.errors('login'), {
				name  : ["can't be empty"],
				email : ["can't be empty"]
			})

			deepEqual(user.errors('default'), {
				name : ["name is required"]
			})

			deepEqual(user.errors(), {
				name  : ["can't be empty", "name is required"],
				email : ["can't be empty"]
			})
		})

		test('Exceptions', function(){
			var User = Map.extend({}), user;

			Validate(User, function(){
				var self = this;

				throws(function(){
					self.addRule('name', 'rangeOf')
				});

				throws(function(){
					self.addRule('name', 'formatOf')
				});

				throws(function(){
					self.addRule('name', 'inclusionOf')
				})

				throws(function(){
					self.addRule('name', 'lengthOf')
				})

				throws(function(){
					self.addRule('name', 'nonExistingValidation')
				})

				this.addRule('*', function(){
					return 'foo';
				})

			});

			var user = new User;

			throws(function(){
				user.errors();
			})
		})

		test('Built in validations', function(){
			var User = Map.extend({}), user;

			Validate(User, function(){
				this.addRule('name', Validate.rules.presenceOf());
				this.addRule('years', Validate.rules.rangeOf(13, 120));
				this.addRule('phoneAreaNumber', Validate.rules.formatOf(/\d{2,3}/))
				this.addRule('phoneNumber', Validate.rules.lengthOf(6, 7))
				this.addRule('salutation', Validate.rules.inclusionOf(['Mr']))
				this.addRule('car', Validate.rules.inclusionOf(['Ford', 'Mazda']))
				this.addRule('motorcycle', Validate.rules.inclusionOf(['Honda', 'Tomos']))
				this.addRule('ssn', Validate.rules.lengthOf(1, 10))
				this.addRule('streetNumber', Validate.rules.numericalityOf())
			})

			user = new User({
				name : '',
				years : 150,
				phoneAreaNumber : 'foo',
				phoneNumber : '3',
				salutation : 'Ms',
				ssn : '12345678901234567890',
				car : 'Ford',
				streetNumber : '1a'
			})

			deepEqual(user.errors(), {
				"name"            : ["can't be empty"],
				"phoneAreaNumber" : ["is invalid"],
				"salutation"      : ["is not a valid option (perhaps out of range)"],
				"ssn"             : ["has wrong length (max = 10)"],
				"streetNumber"    : ["must be a number"],
				"years"           : ["is out of range [13,120]"],
				"phoneNumber"     : ["has wrong length (min = 6)"]
			});
		})

		test('Validating lists', function(){
			var Users = can.List.extend({}), users;

			Validate(Users, function(){
				this.addRule('*.username', 'presenceOf')
			})

			users = new Users([{
				username : 'foo'
			}, {
				username : 'bar'
			}, {
				email : 'foo@bar.baz'
			}])

			deepEqual(users.errors(), {
				'2.username' : ["can't be empty"]
			})

		})

		test('Validating list of strings', function(){
			var User = Map.extend({}), user;

			Validate(User, function(){
				this.addRule('visitedCities.*', 'presenceOf')
			})

			user = new User({
				visitedCities : ['Zagreb', 'Paris', '']
			})

			deepEqual(user.errors(), {
				'visitedCities.2' : ["can't be empty"]
			})
		})

		test('isValid / isAttrValid', function(){
			var User = Map.extend({}), user;

			Validate(User, function(){
				this.addRule('name', 'presenceOf')
			})

			user = new User;

			ok(!user.isValid())

			ok(!user.attrIsValid('name'))
		})
	};
});
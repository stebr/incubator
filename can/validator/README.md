# CanJS Validator

This library implements validations for `can.Map` and `can.List`.

It is different from the official `can/map/validate` plugin in the following ways:

- Support for the nested validations
- Composable validations of nested objects (it calls recursively `error` function)
- Validation rulesets
- Support for the list validations
- It doesn't change `can.Map.prototype` auto magically
- Support for validation on the object level (instead of the attribute level)


# Basic Validation

Validations are set up by passing `constructor` to the validator function:

    steal('can/model', 'validator', function(Model, Validate){
      var User = can.Model.extend({});

      Validate(User, function(){
        this.addRule('name', function(value, path){
          return name === '' ? 'name is required' : null;
        });
      });

      return User;
    });

Validator comes with the built in validations (same as `can/map/validate`):

- presenceOf
- formatOf
- inclusionOf
- lengthOf
- rangeOf
- numericalityOf

Using these validations is a bit different than in the `can/map/validate`:

    steal('can/model', 'validator', function(Model, Validate){
      var User = can.Model.extend({});

      Validate(User, function(){
        this.addRule('name', Validate.rules.presenceOf());
      });

      return User;
    });

As you can see you have to call the validation factory function (`Validate.rules.presenceOf()`). If you have to set up the function in some way (for instance for the `lengthOf` validation) you pass these arguments to the validation factory:

    steal('can/model', 'validator', function(Model, Validate){
      var User = can.Model.extend({});

      Validate(User, function(){
        this.addRule('name', Validate.rules.lengthOf(3, 10));
      });

      return User;
    });

Each validation factory takes the `message` as the last argument:

    steal('can/model', 'validator', function(Model, Validate){
      var User = can.Model.extend({});

      Validate(User, function(){
        this.addRule('name', Validate.rules.presenceOf('name is required'));
      });

      return User;
    });


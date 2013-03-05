steal('can/control', 'can/view/mustache', function(){

var Value = can.Control({
    init: function(){
        this.set()
    },
    "{value} change": "set",
    set: function(){
        this.element.val(this.options.value())
    },
    "change": function(){
        this.options.value(this.element.val())
    }
});

can.Mustache.registerHelper('value', function(value){
  return function(el){
    new Value(el, {value: value});
  }
});

});
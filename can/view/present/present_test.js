steal('onesearch/util/present', 'can/observe/list', 'funcunit/qunit',  'can/view/mustache', function(Present, ObserveList){
	module("Present")

	test("Present takes renderer, instance methods and helpers as arguments", function(){
		var renderer  = can.view.mustache('<ul>{{#todos}}<li>{{.}}</li>{{ plugin todos }}{{/todos}}</ul>');
		var Presenter = Present(renderer, { 
			getFoo: function(){
				return this.context.foo
			}
		}, {
			plugin : function(){
				console.log(this, arguments)
			}
		})
		var div       = document.createElement('div');
		var todos     = new ObserveList;
		var p         = new Presenter({ foo: "bar", todos : todos });

		same("bar", p.getFoo(), "Context is set correctly");

		ok(typeof p.todos !== 'undefined', "Auto getters are created")
		same(p.todos(), todos, "Auto getters work correctly")

		div.appendChild(p.render())

		same(div.innerHTML, "<ul></ul>", "Rendering works")

		todos.push("Todo 1")

		same(div.innerHTML, "<ul><li>Todo 1</li></ul>", "Live binding works")

		console.log(div.innerHTML)
	})
})
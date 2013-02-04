steal('can/control', 'onesearch/util/statemachine', 'funcunit/qunit', function(Control){
	module("Statemachine")

	test("Statemachine", function(){
		var state = Control({
			states : {
				init    : ["view", "edit"],
				edit    : "view",
				view    : ["edit"],
				loading : "*"
			}
		}, {
			// enter `view` state
			"->view state" : function(state, newState, prev, data){
				console.log(arguments, data, "ENTER VIEW STATE")
			},
			// exit view state
			"view-> state" : function(state, newState, prev){
				console.log("EXIT VIEW STATE")
			},
			// transition from view to edit state
			"view->edit state" : function(state){
				console.log("TRANSITION FROM VIEW TO EDIT STATE")
			},
			"->edit state" : function(state){
				console.log("ENTER EDIT STATE")
			},
			"error state" : function(){
				console.log("ERROR", arguments)
			}
		})

		var div = document.createElement('div');
		var machine = new state(div);

		machine.state.current.bind('change', function(){
			console.log("CHANGE STATE")
		})


		equal(machine.state.current(), "init");

		machine.state.go('view', "ble");

		machine.state.go("edit");

		machine.state.go('view');

		machine.state.go("invalid")
	})
})
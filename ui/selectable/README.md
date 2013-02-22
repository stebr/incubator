# Selectable

Deals with nodes in a list that need to show selected states.

Normalizes events between mouse and keyboard when actions executed would be the same.  For instance, enter on a element would be the same as a click on a element.

	<ul id="select">
		<li tabindex="0">1</li>
		<li tabindex="0">2</li>
		<li tabindex="0">3</li>
	</ul>

	var select = new Selectable('#select', {
		multiActivate: true
	});


## Options

- selectOn: "[tabindex]",
- selectedClassName : "hover",
- activatedClassName : "active",
- multiActivate: false
- outsideDeactivate: false
- deactivateParent: document

## Events

- 'activate' - when an item was selected
- 'select' - when an item is 'on' via hover or keyboard

# API

- 'deselect' - deselects all the items selected
- 'selectable' - returns all the items eligible for selecting
- 'activated' - returns all the items activated
- 'selected' - returns all the items selected
- 'select' - pass elements to select
- 'activate' - pass elements to activate
# Positionable

Positionable allows to position an element relative to another. This is very useful for implementing UI widgets, such as tooltips and autocompletes. 

## Usage

When a user clicks a link, the following example will reposition the tooltip above that anchor.

	$('a').click(function(){
		$('.tooltip').positionable({
	        of: $(this),
	        my: "bottom",
	        at: "top"
	    });
	});

Additionally, you can move the tooltip by triggering move on the positionable element.

	$('.tooltip').trigger('move')

### Why?

Why would you use this over just normal position plugin?  

- It allows you to position the element outside the area with the `keep` option
- It listens to a single element, remembering the options for easier access later.  You have to call position everytime with your options if you want to move the element later.
- It listens to 'move' which is a 'reverse' event that will trigger children to move when parent is moved.
- Adds position css classes to the element for CSS styling.

## API

### Options
- `my` Edge of the positionable element to use for positioning. Can be one of "top", "center", "bottom", "left" and "right". Combined values like bottom left are also possible.
- `at` Edge of the target element to use for positioning. Accepts the same values as my.
- `of` - The target element or selector to use for positioning.
- `collision` The collision strategy to use when the positionable element doesn’t fit in the window. Possible values:
	`fit` - Attempts to position the element as close as possible to the target without clipping the positionable.
	`flip` - Flips the element to the opposite side of the target.
	`none` - Doesn’t use any collision strategey.

### Events

- `move` The move event should be triggered whenever a positionable needs to reposition itself. 
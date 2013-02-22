# Tooltip

## Introduction
Tooltips are a enhanced version of the browser `title` attribute.  They offer more specific styling,
better positioning, and triggering.

## Usage

Below initalizes a basic tooltip and reads the title from the tag.  

	<div class="me">
		<a href="#" class="tooltips" data-title="Hovers are fun!">hover over me</a>
		<a href="#" class="tooltips" data-title="Magic is fun!">hover over me</a>
	</div>

Now we init the tooltip by calling the control on the parent element and passing the child selectors
that will contain the tooltips.

	var tip = new Tooltip('.me', { selector: '.tooltips' })

NOTE: This is the preferred method because it only creates one tooltip for all the elements that need a tooltip.

Individual tooltips can alternatively be specified by calling the tooltip on the item itself.  For example:

	<a href="#" class="mytooltip">hover over me</a>

	var tip = new Tooltip('.mytooltip', { title: "Custom title via options" });

You can update the tooltip options by calling `update` on the controller.

	tip.update({ title: 'HTML is fun!' })

## API

### Options
- placement: the position relative to the element to place the popover.  Options include: 'top', 'bottom', 'left', 'right'.
- offset: Add these left-top values to the calculated position, example: "50 50".
- showEvent: The event to show the tooltip.  Default value: 'mouseenter'
- hideEvent: The event to hide the tooltip.  Default value: 'mouseleave'
- collision: Operations to do on DOM collision with window.  Options: 'flip', 'fit', 'none'
- template: HTML template for the tooltip.
- hideDelay: Delay to hide the tooltip after `hide` is triggered.
- showDelay: Delay to show the tooltip after `show` is triggered.
- title: The title to show in the baloon.
- selector : If a selector is provided, tooltip objects will be delegated to the specified targets.

### Methods
- update: Updates the `defaults` of the tooltip.  Arguments: Object
- show: Shows the tooltip.
- hide: Hides the tooltip.
- move: Moves the tooltip.  E.g. window was resized.

### Events
- shown: triggered when all the positioning is complete and the tooltip is shown.
- hidden: triggered when the tooltip has been hidden.
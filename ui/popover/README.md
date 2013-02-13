----
# Popover
----

## Introduction
Popovers are similar to tooltips, except different in few different ways:

- Popovers are generally larger and usually contain more content.  For example, where a 
	tooltip might contain a title or something a popover would contain the whole definition
	with references to other links.

- Popovers are interactable. For example, if I were to put links inside a popover
	when its triggered to appear I can hover inside the popover and click the links.
	A tooltip would disappear once your cursor leaves the content its hovered over.

- Popovers are not associated to a DOM object like tooltips are.  Since popovers
	are not generally tied to a DOM object but interaction such as a failed password
	they are not directly tied to any DOM object unlike a tooltip which is usually
	coupled directly to the 'title' attribute tag.

Like tooltips, popovers will try to position themselves relative and if can't fit
will use the default functionality of the canui.positionable plugin to fit it properly. 

## Usage

Below initalizes a basic popover in hidden state.

	var pop = new mj.ui.Popover('#container', {
		hideDelay: false
	})

Then to show the popover we can call the method directly on the control or
trigger the 'show' event.  We can call/trigger show we pass the header, content,
and wrapped DOM collection or event to which we want to position the popover.

	pop.show('Title', 'Content', $('#inputer'))

or

	$('.mj_ui_popover').trigger('show', ['Title', 'Content', $('#inputer')])

You can hide it by calling 'hide' or trigger the 'hide' event similarly to above.

	pop.hide();

or

	$('.mj_ui_popover').trigger('hide');

## API

### Options

- placement: the position relative to the element to place the popover.  Options include: 'top', 'bottom', 'left', 'right'.
- offset: Add these left-top values to the calculated position, example: "50 50".
- hideDelay: The milliseconds to which the popover will hide after shown.  If you pass 'false', the popover will not be hidden
	until you manually call 'hide'.  Defaults to: 'false'.
- mouseLeaveDelay: The milliseconds to which the popover will hide after the users mouse leaves the popover element.  If you pass
	'false', the popover will not be hidden until you manually call 'hide'.  Defaults to: '500'.
- template: the template to use to render the popover.  Defaults to: 'mj/ui/popover/views/init.ejs'.

### Methods
- show: Shows the popover.  Arguments are: header, content, target.
		header: The header text to show in the popover.  If 'false' is passed, the header element will be hidden.
		content: The content to show in the popover.
		target: A wrapped node collection or event to which to apply the offset.
- hide: Hides the popover instantly.
- hideWithDelay: Hides the popover given a delay or the default delay.  Arguments: delay
- update: Updates the options of the widget.  If 'offset' or 'placement' are reset, the popover will update the positionable 
		plugin too.  Arguments: options

### Events

- show: when triggered will show the popover.
- hide: when triggered will hide the popover.
- shown: triggered when all the positioning is complete and the popover is shown.
- hidden: triggered when the popover has been hidden.
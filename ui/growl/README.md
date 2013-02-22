# Growl

Notification growl-like popups.

	new Notify(options);

	Notify.add({
		header: "Amazing things",
		position: "bottom left",
		text: "Click and hold down your mouse for a moment to pan."
	});

## Options

- time: Time to leave the popup up.  Default: 1500
- position: Position of popup.  Default: "bottom right"
- animate: Animation or not. Default: 'fade'
- sticky: Whether they timeout or stay until dismissed.  Default: true
- template: Template to render the bubbles.  Default: 'views/growl.ejs'
- dismissable: Whether they are dismissable or not.  Default: true

## API

- add
- dismiss
- dismisall
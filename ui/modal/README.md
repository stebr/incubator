# Modal

Modals are streamlined, but flexible, dialog prompts with the minimum required functionality and smart defaults.

	var modal = new Modal('#myModal', options);

## Options

- backdrop - Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
- width - width of modal
- height - height of modal
- animated - whether to animate on show/hide
- drag - whether its draggable or not
- closeButton - whether to show a close button or not
- destroyOnHide - destroy the HTML on hide of modal
- cssClass - css classes to add the outer most div
- header - header text on the modal
- of - thing of which to position it relative inside

## Events

- shown - when the modal was shown
- hidden - when the modal was hidden
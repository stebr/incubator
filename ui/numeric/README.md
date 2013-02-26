# Numeric

Numeric only text box control with spinner buttons.

Listens to keyboard up/down and mousewheel events to increment values.

Example: http://screencast.com/t/Qze8zEcp

__References__
- http://wijmo.com/wiki/index.php/InputNumber
- http://jqueryui.com/spinner/
- https://github.com/flamewave/jqamp-ui-spinner

## Options

- min: 0 // min value picker can go
- max: 100  // max value picker can go
- val: undefined // default value ... number|compute
- culture:  // Use https://github.com/jquery/globalize 
- step: 1 // value to increment when using buttons
-format: 'n' // Most common are "n" for a decimal number and "C" for a currency value 

## Output 

- 'change' - event that triggers with the new and old values
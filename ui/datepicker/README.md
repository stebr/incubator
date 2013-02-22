# Datepicker

Date picker control.

	var datepicker = new Datepicker('#cal');

	datepicker.element.bind('changed', function(ev){
		alert('Selected: '+ ev.date.toDateString());
	});

## Options

- format
- weekStart
- todayHighlight
- todayButton
- startDate
- endDate
- daysOfWeekDisabled
- startView
- language
- val

## API

- val
- setStartDate
- setEndDate
- setDaysOfWeekDisabled
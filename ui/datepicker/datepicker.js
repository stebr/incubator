steal('can/construct/super',
	  'can/control',
	  'can/control/plugin',
	  'can/view/ejs',
	  'can/view/modifiers',
	  './views/init.ejs',
	  './datepicker.less', 
function(){

var Datepicker = can.Control('Datepicker', {

	pluginName: "datepicker",

	defaults:{
		// The date format, combination of d, dd, D, DD, m, mm, M, MM, yy, yyyy.
		// 
		// 		d, dd: Numeric date, no leading zero and leading zero, respectively. Eg, 5, 05.
		// 		D, DD: Abbreviated and full weekday names, respectively. Eg, Mon, Monday.
		// 		m, mm: Numeric month, no leading zero and leading zero, respectively. Eg, 7, 07.
		// 		M, MM: Abbreviated and full month names, respectively. Eg, Jan, January
		// 		yy, yyyy: 2- and 4-digit years, respectively. Eg, 12, 2012.
		// 		
		// 	String. Default: 'mm/dd/yyyy'
		format: 'mm/dd/yyyy',

		// day of the week start. 0 for Sunday - 6 for Saturday
		weekStart: 0,

		// If true, highlights the current date.
		todayHighlight: true,

		// If true or "linked", displays a "Today" button at the bottom of the datepicker 
		// to select the current date. If true, the "Today" button will only move the current 
		// date into view; if "linked", the current date will also be selected.
		todayButton: 'linked',

		// The earliest date that may be selected; all earlier dates will be disabled
		// Date. Default: Beginning of time
		startDate: undefined,

		// The latest date that may be selected; all later dates will be disabled
		// Date. Default: End of time
		endDate: undefined,

		// Days of the week that should be disabled. Values are 0 (Sunday) to 6 (Saturday). 
		// Multiple values should be comma-separated. Example: disable weekends: '0,6' or [0,6].
		daysOfWeekDisabled: [],

		// The view that the datepicker should show when it is opened.
		//  Accepts values of 0 or 'month' for month view (the default), 1 
		//  or 'year' for the 12-month overview, and 2 or 'decade' for the 
		//  10-year overview. Useful for date-of-birth datepickers
		startView: 'month',

		// The two-letter code of the language to use for month and day names. 
		// These will also be used as the input's value (and subsequently sent to 
		// the server in the case of form submissions). Currently ships with English ('en'), 
		// German ('de'), Brazilian ('br'), and Spanish ('es') translations, but others can
		// be added (see I18N below). If an unknown language code is given, English will be used
		language: 'en',

		// Default value to start the date picker on.  Values are String|Date
		value: null
	}
},{

	startDate: -Infinity,
	endDate: Infinity,
	viewMode: 0,
	startViewMode: 0,

	setup:function(el,options){
		options = $.extend( this.constructor.defaults, options || {} );

		var div = $(can.view.render('views/init.ejs', {
			rtl: dates[options.language].rtl
		})).appendTo(el);

		this._super(div, options);
	},

	init:function(){
		// setup some basic options
		this.weekStart = ((dates[this.options.language].weekStart || 0) % 7);
		this.weekEnd = ((this.weekStart + 6) % 7);

		this.format = DPGlobal.parseFormat(this.options.format);
		this.setViewMode(this.options.startView);
		this.setStartDate(this.options.startDate);
		this.setEndDate(this.options.endDate);
		this.setDaysOfWeekDisabled(this.options.daysOfWeekDisabled);

		// fill in
		this.fillDow();
		this.fillMonths();
		this.val(this.options.value)
		this.showMode();
	},

	// =============================== API ===============================

	/**
	 * Sets / Returns current date.
	 *
	 * 	Get current date:
	 * 	
	 *		var current = $('#datepicker').datepicker('val');
	 *
	 *	Set current date:
	 *
	 * 		$('#datepicker').datepicker('val', '2012-12-31');
	 * 
	 * @param  {[String]} date
	 */
	val: function(date){
		if(date === undefined){
			return this.getFormattedDate();
		}

		this.date = DPGlobal.parseDate(date, this.format, this.options.language);
		this.updateViewDate();
	},

	/**
	 * Sets a new lower date limit on the datepicker.
	 * 
	 * 		$('#datepicker').datepicker('setStartDate', '2012-01-01');
	 * 		
	 * 	Omit startDate (or provide an otherwise falsey value) to unset the limit.
	 * 	
	 * 		$('#datepicker').datepicker('setStartDate');
	 * 		$('#datepicker').datepicker('setStartDate', null);
	 * 		
	 * 	@param {[String]} startDate
	 */
	setStartDate: function(startDate){
		this.startDate = startDate || -Infinity;

		if (this.startDate !== -Infinity) {
			this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.options.language);
		}

		this.updateViewDate();
		this.updateNavArrows();
	},

	/**
	 * Sets a new upper date limit on the datepicker.
	 * 
	 * 		$('#datepicker').datepicker('setEndDate', '2012-12-31');
	 * 		
	 * 	Omit endDate (or provide an otherwise falsey value) to unset the limit.
	 * 	
	 * 		$('#datepicker').datepicker('setEndDate');
	 * 		$('#datepicker').datepicker('setEndDate', null);
	 * 		
	 * @param {[String]} endDate 
	 */
	setEndDate: function(endDate){
		this.endDate = endDate || Infinity;

		if (this.endDate !== Infinity) {
			this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.options.language);
		}

		this.updateViewDate();
		this.updateNavArrows();
	},

	/**
	 * Sets the days of week that should be disabled.
	 * 
	 * 		$('#datepicker').datepicker('setDaysOfWeekDisabled', [0,6]);
	 * 		
	 * 	Omit daysOfWeekDisabled (or provide an otherwise falsey value) to unset the disabled days.
	 * 	
	 * 		$('#datepicker').datepicker('setDaysOfWeekDisabled');
	 * 		$('#datepicker').datepicker('setDaysOfWeekDisabled', null);
	 * 		
	 * @param {[String|Array]} daysOfWeekDisabled
	 */
	setDaysOfWeekDisabled: function(daysOfWeekDisabled){
		this.daysOfWeekDisabled = daysOfWeekDisabled || [];

		if (!$.isArray(this.daysOfWeekDisabled)) {
			this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
		}

		this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, function (d) {
			return parseInt(d, 10);
		});

		this.updateViewDate();
		this.updateNavArrows();
	},

	/**
	 * Update the datepicker with the current input value.
	 */
	updateViewDate: function(){
		var oldViewDate = this.viewDate;
		if (this.date < this.startDate) {
			this.viewDate = new Date(this.startDate);
		} else if (this.date > this.endDate) {
			this.viewDate = new Date(this.endDate);
		} else {
			this.viewDate = new Date(this.date);
		}

		if (oldViewDate && oldViewDate.getTime() != this.viewDate.getTime()){
			//this.element.trigger({
			//	type: 'changed',
			//	date: this.viewDate
			//});
		}

		this.fill();
	},

	// =============================== Drawing ===============================

	fillDow: function(){
		var dowCnt = this.weekStart,
			html = ['<tr>'];

		while (dowCnt < this.weekStart + 7) {
			html.push('<th class="dow">' + dates[this.options.language].daysMin[(dowCnt++)%7] + '</th>');
		}

		html.push('</tr>');

		this.element.find('.datepicker-days thead').append(html.join(''));
	},

	fillMonths: function(){
		var html = [],
			i = 0;

		while (i < 12) {
			html.push('<span class="month">' + dates[this.options.language].monthsShort[i++] + '</span>');
		}

		this.element.find('.datepicker-months td').html(html.join(''));
	},

	fill: function() {
		var d = new Date(this.viewDate),
			year = d.getUTCFullYear(),
			month = d.getUTCMonth(),
			startYear = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity,
			startMonth = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity,
			endYear = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity,
			endMonth = this.endDate !== Infinity ? this.endDate.getUTCMonth() : Infinity,
			currentDate = this.date && this.date.valueOf(),
			today = new Date();

		this.element.find('.datepicker-days thead th:eq(1)')
					.text(dates[this.options.language].months[month] + ' ' + year);

		this.element.find('tfoot th.today')
					.text(dates[this.options.language].today)
					.toggle(this.options.todayButton !== false);

		this.updateNavArrows();
		this.fillMonths();

		var prevMonth = UTCDate(year, month-1, 28,0,0,0,0),
			day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());

		prevMonth.setUTCDate(day);
		prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7)%7);

		var nextMonth = new Date(prevMonth);
		nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
		nextMonth = nextMonth.valueOf();
		var html = [];
		var clsName;

		while(prevMonth.valueOf() < nextMonth) {
			if (prevMonth.getUTCDay() == this.weekStart) {
				html.push('<tr>');
			}

			clsName = '';

			if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() < month)) {
				clsName += ' old';
			} else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() > month)) {
				clsName += ' new';
			}

			// Compare internal UTC date with local today, not UTC today
			if (this.options.todayHighlight &&
				prevMonth.getUTCFullYear() == today.getFullYear() &&
				prevMonth.getUTCMonth() == today.getMonth() &&
				prevMonth.getUTCDate() == today.getDate()) {
				clsName += ' today';
			}

			if (currentDate && prevMonth.valueOf() == currentDate) {
				clsName += ' active';
			}

			if (prevMonth.valueOf() < this.startDate || prevMonth.valueOf() > this.endDate ||
				$.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1) {
				clsName += ' disabled';
			}

			html.push('<td class="day' + clsName + '">' + prevMonth.getUTCDate() + '</td>');

			if (prevMonth.getUTCDay() == this.weekEnd) {
				html.push('</tr>');
			}

			prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
		}

		this.element.find('.datepicker-days tbody').html(html.join(''));

		var currentYear = this.date && this.date.getUTCFullYear();
		var months = this.element.find('.datepicker-months')
					.find('th:eq(1)')
						.text(year)
						.end()
					.find('span').removeClass('active');

		if (currentYear && currentYear == year) {
			months.eq(this.date.getUTCMonth()).addClass('active');
		}

		if (year < startYear || year > endYear) {
			months.addClass('disabled');
		}

		if (year == startYear) {
			months.slice(0, startMonth).addClass('disabled');
		}

		if (year == endYear) {
			months.slice(endMonth+1).addClass('disabled');
		}

		html = '';
		year = parseInt(year/10, 10) * 10;
		var yearCont = this.element.find('.datepicker-years')
							.find('th:eq(1)')
								.text(year + '-' + (year + 9))
								.end()
							.find('td');

		year -= 1;
		for (var i = -1; i < 11; i++) {
			html += '<span class="year'+(i == -1 || i == 10 ? ' old' : '')+(currentYear == year ? ' active' : '')+(year < startYear || year > endYear ? ' disabled' : '')+'">'+year+'</span>';
			year += 1;
		}

		yearCont.html(html);
	},

	updateNavArrows: function() {
		var d = new Date(this.viewDate),
			year = d.getUTCFullYear(),
			month = d.getUTCMonth();

		switch (this.viewMode) {
			case 0:
				if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth()) {
					this.element.find('.prev').css({visibility: 'hidden'});
				} else {
					this.element.find('.prev').css({visibility: 'visible'});
				}
				if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth()) {
					this.element.find('.next').css({visibility: 'hidden'});
				} else {
					this.element.find('.next').css({visibility: 'visible'});
				}
				break;
			case 1:
			case 2:
				if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()) {
					this.element.find('.prev').css({visibility: 'hidden'});
				} else {
					this.element.find('.prev').css({visibility: 'visible'});
				}
				if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()) {
					this.element.find('.next').css({visibility: 'hidden'});
				} else {
					this.element.find('.next').css({visibility: 'visible'});
				}
				break;
		}
	},

	moveYear: function(date, dir){
		return this.moveMonth(date, dir*12);
	},

	moveMonth: function(date, dir){
		if (!dir) {
			return date;
		}

		var new_date = new Date(date.valueOf()),
			day = new_date.getUTCDate(),
			month = new_date.getUTCMonth(),
			mag = Math.abs(dir),
			new_month, test;

		dir = dir > 0 ? 1 : -1;

		if (mag == 1){
			test = dir == -1
				// If going back one month, make sure month is not current month
				// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
				? function(){ return new_date.getUTCMonth() == month; }
				// If going forward one month, make sure month is as expected
				// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
				: function(){ return new_date.getUTCMonth() != new_month; };
			new_month = month + dir;
			new_date.setUTCMonth(new_month);

			// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
			if (new_month < 0 || new_month > 11){
				new_month = (new_month + 12) % 12;
			}
		} else {
			// For magnitudes >1, move one month at a time...
			for (var i=0; i<mag; i++){
				// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
				new_date = this.moveMonth(new_date, dir);
			}

			// ...then reset the day, keeping it in the new month
			new_month = new_date.getUTCMonth();
			new_date.setUTCDate(day);
			test = function(){ return new_month != new_date.getUTCMonth(); };
		}

		// Common date-resetting loop -- if date is beyond end of month, make it
		// end of month
		while (test()){
			new_date.setUTCDate(--day);
			new_date.setUTCMonth(new_month);
		}

		return new_date;
	},

	showMode: function(dir) {
		if (dir) {
			this.viewMode = Math.max(0, Math.min(2, this.viewMode + dir));
		}

		this.element.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
		this.updateNavArrows();
	},

	changeView:function(elm,ev){
		var dir = DPGlobal.modes[this.viewMode].navStep * (elm.hasClass('prev') ? -1 : 1);

		switch(this.viewMode){
			case 0:
				this.viewDate = this.moveMonth(this.viewDate, dir);
				break;
			case 1:
			case 2:
				this.viewDate = this.moveYear(this.viewDate, dir);
				break;
		}

		this.fill();
	},

	// =============================== Events ===============================

	".switch click":function(elm,ev){
		this.showMode(1);
	},

	".today click":function(elm,ev){
		var date = new Date();
		date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

		this.showMode(-2);
		var which = this.options.todayButton == 'linked' ? null : 'view';
		this.setDate(date, which);
	},

	".day:not(.disabled) click":function(elm,ev){
		ev.stopPropagation();

		var day = parseInt(elm.text(), 10)||1;
		var year = this.viewDate.getUTCFullYear(),
			month = this.viewDate.getUTCMonth();

		if (elm.is('.old')) {
			if (month === 0) {
				month = 11;
				year -= 1;
			} else {
				month -= 1;
			}
		} else if (elm.is('.new')) {
			if (month == 11) {
				month = 0;
				year += 1;
			} else {
				month += 1;
			}
		}

		this.setDate(UTCDate(year, month, day,0,0,0,0));
	},

	".month:not(.disabled) click":function(elm,ev){
		ev.stopPropagation();

		this.viewDate.setUTCDate(1);

		var month = elm.parent().find('span').index(elm);
		this.viewDate.setUTCMonth(month);

		this.element.trigger({
			type: 'changedMonth',
			date: this.viewDate
		});

		this.showMode(-1);
		this.fill();
	},

	".year:not(.disabled) click":function(elm,ev){
		ev.stopPropagation();
		
		this.viewDate.setUTCDate(1);

		var year = parseInt(elm.text(), 10)||0;
		this.viewDate.setUTCFullYear(year);

		this.element.trigger({
			type: 'changedYear',
			date: this.viewDate
		});

		this.showMode(-1);
		this.fill();
	},

	".prev click": "changeView",

	".next click": "changeView",

	// =============================== Getters/Setters ===============================
	
	getFormattedDate: function(format) {
		if(format == undefined) {
			format = this.format;
		}

		return DPGlobal.formatDate(this.date, format, this.options.language);
	},
	
	setDate: function(date, which){
		if (!which || which == 'date'){
			this.date = date;
		}

		if (!which || which  == 'view'){
			this.viewDate = date;
		}

		this.fill();

		this.element.trigger({
			type: 'changed',
			date: this.date
		});
	},

	setViewMode:function(view){
		switch(view){
			case 2:
			case 'decade':
				this.viewMode = this.startViewMode = 2;
				break;
			case 1:
			case 'year':
				this.viewMode = this.startViewMode = 1;
				break;
		}
	}

});

// Helpers
var UTCDate = function(){
	return new Date(Date.UTC.apply(Date, arguments));
}, UTCToday = function(){
	var today = new Date();
	return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
};

// English
var dates = $.fn.datepicker.dates = {
	en: {
		days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		today: "Today"
	}
};

// Globalization
var DPGlobal = {
	modes: [
		{
			clsName: 'days',
			navFnc: 'Month',
			navStep: 1
		},
		{
			clsName: 'months',
			navFnc: 'FullYear',
			navStep: 1
		},
		{
			clsName: 'years',
			navFnc: 'FullYear',
			navStep: 10
	}],

	isLeapYear: function (year) {
		return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
	},

	getDaysInMonth: function (year, month) {
		return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
	},

	validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,

	nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,

	parseFormat: function(format){
		// IE treats \0 as a string end in inputs (truncating the value),
		// so it's a bad format delimiter, anyway
		var separators = format.replace(this.validParts, '\0').split('\0'),
			parts = format.match(this.validParts);

		if (!separators || !separators.length || !parts || parts.length == 0){
			throw new Error("Invalid date format.");
		}

		return {separators: separators, parts: parts};
	},

	parseDate: function(date, format, language) {
		if (date instanceof Date) return date;
		if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
			var part_re = /([-+]\d+)([dmwy])/,
				parts = date.match(/([-+]\d+)([dmwy])/g),
				part, dir;
			date = new Date();

			for (var i=0; i<parts.length; i++) {
				part = part_re.exec(parts[i]);
				dir = parseInt(part[1]);
				switch(part[2]){
					case 'd':
						date.setUTCDate(date.getUTCDate() + dir);
						break;
					case 'm':
						date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
						break;
					case 'w':
						date.setUTCDate(date.getUTCDate() + dir * 7);
						break;
					case 'y':
						date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
						break;
				}
			}
			return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
		}

		var parts = date && date.match(this.nonpunctuation) || [],
			date = new Date(),
			parsed = {},
			setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
			setters_map = {
				yyyy: function(d,v){ return d.setUTCFullYear(v); },
				yy: function(d,v){ return d.setUTCFullYear(2000+v); },
				m: function(d,v){
					v -= 1;
					while (v<0) v += 12;
					v %= 12;
					d.setUTCMonth(v);
					while (d.getUTCMonth() != v)
						d.setUTCDate(d.getUTCDate()-1);
					return d;
				},
				d: function(d,v){ return d.setUTCDate(v); }
			},
			val, filtered, part;

		setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
		setters_map['dd'] = setters_map['d'];
		date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
		var fparts = format.parts.slice();

		// Remove noop parts
		if (parts.length != fparts.length) {
			fparts = $(fparts).filter(function(i,p){
				return $.inArray(p, setters_order) !== -1;
			}).toArray();
		}

		// Process remainder
		if (parts.length == fparts.length) {
			for (var i=0, cnt = fparts.length; i < cnt; i++) {
				val = parseInt(parts[i], 10);
				part = fparts[i];
				if (isNaN(val)) {
					switch(part) {
						case 'MM':
							filtered = $(dates[language].months).filter(function(){
								var m = this.slice(0, parts[i].length),
									p = parts[i].slice(0, m.length);
								return m == p;
							});
							val = $.inArray(filtered[0], dates[language].months) + 1;
							break;
						case 'M':
							filtered = $(dates[language].monthsShort).filter(function(){
								var m = this.slice(0, parts[i].length),
									p = parts[i].slice(0, m.length);
								return m == p;
							});
							val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
							break;
					}
				}
				parsed[part] = val;
			}

			for (var i=0, s; i<setters_order.length; i++){
				s = setters_order[i];
				if (s in parsed && !isNaN(parsed[s]))
					setters_map[s](date, parsed[s])
			}
		}

		return date;
	},

	formatDate: function(date, format, language){
		var val = {
			d: date.getUTCDate(),
			D: dates[language].daysShort[date.getUTCDay()],
			DD: dates[language].days[date.getUTCDay()],
			m: date.getUTCMonth() + 1,
			M: dates[language].monthsShort[date.getUTCMonth()],
			MM: dates[language].months[date.getUTCMonth()],
			yy: date.getUTCFullYear().toString().substring(2),
			yyyy: date.getUTCFullYear()
		};

		val.dd = (val.d < 10 ? '0' : '') + val.d;
		val.mm = (val.m < 10 ? '0' : '') + val.m;
		var date = [],
			seps = $.extend([], format.separators);

		for (var i=0, cnt = format.parts.length; i < cnt; i++) {
			if (seps.length)
				date.push(seps.shift())
			date.push(val[format.parts[i]]);
		}

		return date.join('');
	}
};

});
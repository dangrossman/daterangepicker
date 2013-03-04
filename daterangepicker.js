/**
* @version: 1.1
* @author: Dan Grossman http://www.dangrossman.info/
* @date: 2013-03-04
* @copyright: Copyright (c) 2012 Dan Grossman. All rights reserved.
* @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
* @website: http://www.improvely.com/
*/
!function ($) {

    var DateRangePicker = function (element, options, cb) {
        var hasOptions = typeof options == 'object';
        var localeObject;

        //state
        this.startDate = Date.today();
        this.endDate = Date.today();
        this.minDate = false;
        this.maxDate = false;
        this.changed = false;
        this.cleared = false;
        this.showDropdowns = false;
        this.ranges = {};
        this.dateLimit = false;
        this.opens = 'right';
        this.cb = function () { };
        this.format = 'MM/dd/yyyy';
        this.separator = ' - ';
        this.showWeekNumbers = false;
        this.buttonClasses = ['btn-success'];
        this.applyClass = 'btn btn-small btn-success';
        this.clearClass = 'btn btn-small';
        this.locale = {
            applyLabel: 'Apply',
            clearLabel:"Clear",
            fromLabel: 'From',
            toLabel: 'To',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: Date.CultureInfo.shortestDayNames,
            monthNames: Date.CultureInfo.monthNames,
            firstDay: 0
        };

        localeObject = this.locale;

        this.leftCalendar = {
            month: Date.today().set({ day: 1, month: this.startDate.getMonth(), year: this.startDate.getFullYear() }),
            calendar: Array()
        };

        this.rightCalendar = {
            month: Date.today().set({ day: 1, month: this.endDate.getMonth(), year: this.endDate.getFullYear() }),
            calendar: Array()
        };

        //element that triggered the date range picker
        this.element = $(element);

        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        if (this.element.is('input')) {
            this.element.on({
                click: $.proxy(this.show, this),
                focus: $.proxy(this.show, this)
            });
        } else {
            this.element.on('click', $.proxy(this.show, this));
        }

        if (hasOptions) {
            if(typeof options.locale == 'object') {
                $.each(localeObject, function (property, value) {
                    localeObject[property] = options.locale[property] || value;
                });
            }

            if (options.applyClass) {
                this.applyClass = options.applyClass;
            }

            if (options.clearClass) {
                this.clearClass = options.clearClass;
            }
        }

        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar left"></div>' +
                '<div class="calendar right"></div>' +
                '<div class="ranges">' +
                  '<div class="range_inputs">' +
                    '<div class="daterangepicker_start_input" style="float: left">' +
                      '<label for="daterangepicker_start">' + this.locale.fromLabel + '</label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
                    '</div>' +
                    '<div class="daterangepicker_end_input" style="float: left; padding-left: 11px">' +
                      '<label for="daterangepicker_end">' + this.locale.toLabel + '</label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
                    '</div>' +
                    '<button class="' + this.applyClass + ' applyBtn" disabled="disabled">' + this.locale.applyLabel + '</button>&nbsp;' +
                    '<button class="' + this.clearClass + ' clearBtn">' + this.locale.clearLabel + '</button>' +
                  '</div>' +
                '</div>' +
              '</div>';

        this.container = $(DRPTemplate).appendTo('body');

        if (hasOptions) {

            if (typeof options.format == 'string')
                this.format = options.format;

            if (typeof options.separator == 'string')
                this.separator = options.separator;

            if (typeof options.startDate == 'string')
                this.startDate = Date.parseExact(options.startDate, this.format);

            if (typeof options.endDate == 'string')
                this.endDate = Date.parseExact(options.endDate, this.format);

            if (typeof options.minDate == 'string')
                this.minDate = Date.parseExact(options.minDate, this.format);

            if (typeof options.maxDate == 'string')
                this.maxDate = Date.parseExact(options.maxDate, this.format);

            if (typeof options.startDate == 'object')
                this.startDate = options.startDate;

            if (typeof options.endDate == 'object')
                this.endDate = options.endDate;

            if (typeof options.minDate == 'object')
                this.minDate = options.minDate;

            if (typeof options.maxDate == 'object')
                this.maxDate = options.maxDate;

            if (typeof options.ranges == 'object') {
                for (var range in options.ranges) {

                    var start = options.ranges[range][0];
                    var end = options.ranges[range][1];

                    if (typeof start == 'string')
                        start = Date.parse(start);

                    if (typeof end == 'string')
                        end = Date.parse(end);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start < this.minDate)
                        start = this.minDate;

                    if (this.maxDate && end > this.maxDate)
                        end = this.maxDate;

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end < this.minDate) || (this.maxDate && start > this.maxDate))
                    {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (var range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                this.container.find('.ranges').prepend(list);
            }
            
            if (typeof options.dateLimit == 'object')
                this.dateLimit = options.dateLimit;

            // update day names order to firstDay
            if (typeof options.locale == 'object') {
                if (typeof options.locale.firstDay == 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while (iterator > 0) {
                        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                        iterator--;
                    }
                }
            }

            if (typeof options.opens == 'string')
                this.opens = options.opens;

            if (typeof options.showWeekNumbers == 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses == 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses == 'object') {
                this.buttonClasses = options.buttonClasses;
            }
            
            if (typeof options.showDropdowns == 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

        }

        //apply CSS classes to buttons
        var c = this.container;
        $.each(this.buttonClasses, function (idx, val) {
            c.find('button').addClass(val);
        });

        if (this.opens == 'right') {
            //swap calendar positions
            var left = this.container.find('.calendar.left');
            var right = this.container.find('.calendar.right');
            left.removeClass('left').addClass('right');
            right.removeClass('right').addClass('left');
        }

        if (typeof options == 'undefined' || typeof options.ranges == 'undefined')
            this.container.find('.calendar').show();

        if (typeof cb == 'function')
            this.cb = cb;

        this.container.addClass('opens' + this.opens);

        //try parse date if in text input
        if (!hasOptions || (typeof options.startDate == 'undefined' && typeof options.endDate == 'undefined')) {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val();
                var split = val.split(this.separator);
                
                if(split.length == 2) {
                    this.startDate = Date.parseExact(split[0], this.format);
                    this.endDate = Date.parseExact(split[1], this.format);
                }
            }
        }        

        //event listeners
        this.container.on('mousedown', $.proxy(this.mousedown, this));
        this.container.find('.calendar').on('click', '.prev', $.proxy(this.clickPrev, this));
        this.container.find('.calendar').on('click', '.next', $.proxy(this.clickNext, this));
        this.container.find('.ranges').on('click', 'button.applyBtn', $.proxy(this.clickApply, this));
        this.container.find('.ranges').on('click', 'button.clearBtn', $.proxy(this.clickClear, this));

        this.container.find('.calendar').on('click', 'td.available', $.proxy(this.clickDate, this));
        this.container.find('.calendar').on('mouseenter', 'td.available', $.proxy(this.enterDate, this));
        this.container.find('.calendar').on('mouseleave', 'td.available', $.proxy(this.updateView, this));

        this.container.find('.ranges').on('click', 'li', $.proxy(this.clickRange, this));
        this.container.find('.ranges').on('mouseenter', 'li', $.proxy(this.enterRange, this));
        this.container.find('.ranges').on('mouseleave', 'li', $.proxy(this.updateView, this));
        
        this.container.find('.calendar').on('change', 'select.yearselect', $.proxy(this.updateYear, this));
        this.container.find('.calendar').on('change', 'select.monthselect', $.proxy(this.updateMonth, this));

        this.element.on('keyup', $.proxy(this.updateFromControl, this));

        this.updateView();
        this.updateCalendars();

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        mousedown: function (e) {        
            e.stopPropagation();
            
            //allow select list to function normally
            if(!this.showDropdowns || $(e.target).not('select').length)
                e.preventDefault();
        },

        updateView: function () {
            this.leftCalendar.month.set({ month: this.startDate.getMonth(), year: this.startDate.getFullYear() });
            this.rightCalendar.month.set({ month: this.endDate.getMonth(), year: this.endDate.getFullYear() });

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.toString(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.toString(this.format));

            if (this.startDate.equals(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;

            var dateString = this.element.val().split(this.separator);
            var start = Date.parseExact(dateString[0], this.format);
            var end = Date.parseExact(dateString[1], this.format);

            if (start == null || end == null) return;
            if (end.isBefore(start)) return;

            this.startDate = start;
            this.endDate = end;

            this.updateView();
            this.cb(this.startDate, this.endDate);
            this.updateCalendars();
        },

        notify: function () {
            if (!this.cleared) {
              this.updateView();
            }

            if (this.element.is('input')) {
                this.element.val(this.cleared ? '' : this.startDate.toString(this.format) + this.separator + this.endDate.toString(this.format));
            }
            var arg1 = (this.cleared ? null : this.startDate),
                arg2 = (this.cleared ? null : this.endDate);
            this.cleared = false;
            this.cb(arg1,arg2);
        },

        move: function () {
            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight(),
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight(),
                    left: this.element.offset().left,
                    right: 'auto'
                });
            }
        },

        show: function (e) {
            this.container.show();
            this.move();

            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            this.changed = false;
            
            this.element.trigger('shown',{target:e.target,picker:this});

            $(document).on('mousedown', $.proxy(this.hide, this));
        },

        hide: function (e) {
            this.container.hide();
            $(document).off('mousedown', this.hide);

            if (this.changed) {
                this.changed = false;
                this.notify();
            }
        },

        enterRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].toString(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].toString(this.format));
            }
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.container.find('.calendar').show();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                this.leftCalendar.month.set({ month: this.startDate.getMonth(), year: this.startDate.getFullYear() });
                this.rightCalendar.month.set({ month: this.endDate.getMonth(), year: this.endDate.getFullYear() });
                this.updateCalendars();

                this.changed = true;

                this.container.find('.calendar').hide();
                this.hide();
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add({ months: -1 });
            } else {
                this.rightCalendar.month.add({ months: -1 });
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add({ months: 1 });
            } else {
                this.rightCalendar.month.add({ months: 1 });
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].toString(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].toString(this.format));
            }

        },

        clickDate: function (e) {
            var title = $(e.target).attr('title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                startDate = this.leftCalendar.calendar[row][col];
                endDate = this.endDate;
                if (typeof this.dateLimit == 'object') {
                    var maxDate = new Date(startDate).add(this.dateLimit);
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
                this.element.trigger('clicked', {
                  dir: 'left',
                  picker: this
                });
            } else {
                startDate = this.startDate;
                endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit == 'object') {
                    var negConfig = {
                        days: 0 - this.dateLimit.days,
                        months: 0 - this.dateLimit.months,
                        years: 0 - this.dateLimit.years
                    };
                    var minDate = new Date(endDate).add(negConfig);
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }                
                this.element.trigger('clicked', {
                  dir: 'right',
                  picker: this
                });
            }

            cal.find('td').removeClass('active');

            if (startDate.equals(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass('active');
                if (!startDate.equals(this.startDate) || !endDate.equals(this.endDate))
                    this.changed = true;
                this.startDate = startDate;
                this.endDate = endDate;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass('active');
                this.changed = true;
                this.startDate = startDate;
                this.endDate = startDate.clone().add(1).days();
            }

            this.leftCalendar.month.set({ month: this.startDate.getMonth(), year: this.startDate.getFullYear() });
            this.rightCalendar.month.set({ month: this.endDate.getMonth(), year: this.endDate.getFullYear() });
            this.updateCalendars();
        },

        clickApply: function (e) {
            this.hide();
        },

        clickClear: function (e) {
            this.changed = true;
            this.cleared = true;
            this.hide();
        },
        
        updateYear: function(e) {
            var year = parseInt($(e.target).val());
            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            
            if(isLeft) {
                this.leftCalendar.month.set({ month: this.startDate.getMonth(), year: year });
            } else { 
                this.rightCalendar.month.set({ month: this.endDate.getMonth(), year: year });
            }
            
            this.updateCalendars();
        },
        
        updateMonth: function(e) {
            var month = parseInt($(e.target).val());
            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            
            if(isLeft) {
                this.leftCalendar.month.set({ month: month, year: this.startDate.getFullYear() });
            } else {
                this.rightCalendar.month.set({ month: month, year: this.endDate.getFullYear() });
            }
            
            this.updateCalendars();
        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.getMonth(), this.leftCalendar.month.getFullYear());
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.getMonth(), this.rightCalendar.month.getFullYear());
            this.container.find('.calendar.left').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find('.calendar.right').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));

            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.startDate.equals(this.ranges[range][0]) && this.endDate.equals(this.ranges[range][1])) {
                    customRange = false;
                    this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                }
                i++;
            }
            if (customRange)
                this.container.find('.ranges li:last').addClass('active');

            this.element.trigger('updated', this);
        },

        buildCalendar: function (month, year) {

            var firstDay = Date.today().set({ day: 1, month: month, year: year });
            var lastMonth = firstDay.clone().add(-1).day().getMonth();
            var lastYear = firstDay.clone().add(-1).day().getFullYear();

            var daysInMonth = Date.getDaysInMonth(year, month);
            var daysInLastMonth = Date.getDaysInMonth(lastYear, lastMonth);

            var dayOfWeek = firstDay.getDay();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = Array();
            for (var i = 0; i < 6; i++) {
                calendar[i] = Array();
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = Date.today().set({ day: startDay, month: lastMonth, year: lastYear });
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = curDate.clone().add(1).day()) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate;
            }

            return calendar;

        },
        
        renderDropdowns: function (selected, minDate, maxDate) {                        
            var currentMonth = selected.getMonth();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;
            
            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.getMonth()) && (!inMaxYear || m <= maxDate.getMonth())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";
            
            var currentYear = selected.getFullYear();
            var maxYear = (maxDate && maxDate.getFullYear()) || (currentYear + 5);
            var minYear = (minDate && minDate.getFullYear()) || (currentYear - 50); 
            var yearHtml = '<select class="yearselect">'
            
            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }
            
            yearHtml += '</select>';
            
            return monthHtml + yearHtml;
        },

        renderCalendar: function (calendar, selected, minDate, maxDate) {
            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';
            
            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';
            
            if (!minDate || minDate < calendar[1][1]) {
                html += '<th class="prev available"><i class="icon-arrow-left"></i></th>';
            } else {
                html += '<th></th>';
            }
            
            var dateHtml = this.locale.monthNames[calendar[1][1].getMonth()] + calendar[1][1].toString(" yyyy");
            
            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }
            
            html += '<th colspan="5" style="width: auto">' + dateHtml + '</th>';
            if (!maxDate || maxDate > calendar[1][1]) {
                html += '<th class="next available"><i class="icon-arrow-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';
            
            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';
                
                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].getWeek() + '</td>';
                
                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].getMonth() == calendar[1][1].getMonth()) ? '' : 'off';

                    // Normalise the time so the comparison won't fail
                    selected.setHours(0,0,0,0);

                    if ((minDate && calendar[row][col] < minDate) || (maxDate && calendar[row][col] > maxDate)) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].equals(selected)) {
                        cname += ' active ';
                        if (calendar[row][col].equals(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].equals(this.endDate)) { cname += ' end-date '; }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].equals(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].equals(this.endDate)) { cname += ' end-date '; }
                    }
                    
                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g,' ').replace(/^\s?(.*?)\s?$/,'$1') + '" title="' + title + '">' + calendar[row][col].getDate() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            return html;

        }

    };

    $.fn.daterangepicker = function (options, cb) {
      this.each(function() {
        var el = $(this);
        if (!el.data('daterangepicker'))
          el.data('daterangepicker', new DateRangePicker(el, options, cb));
      });
      return this;
    };

} (window.jQuery);

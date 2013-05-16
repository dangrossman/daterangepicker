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
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.changed = false;
        this.cleared = false;
        this.showDropdowns = false;
        this.dropdownAdjusts = false;
        this.ranges = {};
        this.dateLimit = false;
        this.opens = 'right';
        this.cb = function () { };
        this.format = 'MM/DD/YYYY';
        this.separator = ' - ';
        this.showWeekNumbers = false;
        this.buttonClasses = ['btn'];
        this.applyClass = 'btn btn-small btn-success';
        this.clearClass = 'btn btn-small';
        this.locale = {
            applyLabel: 'Apply',
            clearLabel: "Clear",
            fromLabel: 'From',
            toLabel: 'To',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: moment()._lang._weekdaysMin,
            monthNames: moment()._lang._monthsShort,
            firstDay: 0
        };

        localeObject = this.locale;

        this.leftCalendar = {
            month: moment([this.startDate.year(), this.startDate.month(), 1]),
            calendar: []
        };

        this.rightCalendar = {
            month: moment([this.endDate.year(), this.endDate.month(), 1]),
            calendar: []
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
            if (typeof options.locale == 'object') {
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
                this.startDate = moment(options.startDate, this.format).startOf('day');

            if (typeof options.endDate == 'string')
                this.endDate = moment(options.endDate, this.format).endOf('day');

            if (typeof options.minDate == 'string')
                this.minDate = moment(options.minDate, this.format).startOf('day');

            if (typeof options.maxDate == 'string')
                this.maxDate = moment(options.maxDate, this.format).endOf('day');

            if (typeof options.startDate == 'object') {
                if (options.startDate instanceof  Date) {
                    this.startDate = moment(options.startDate).startOf('day');
                } else {
                    this.startDate = options.startDate.startOf('day');
                }
            }

            if (typeof options.endDate == 'object') {
                if (options.endDate instanceof Date) {
                    this.endDate = moment(options.endDate).endOf('day');
                } else {
                    this.endDate = options.endDate.endOf('day');
                }
            }

            if (typeof options.minDate == 'object') {
                if (options.minDate instanceof Date) {
                    this.minDate = moment(options.minDate).startOf('day');
                } else {
                    this.minDate = options.minDate.startOf('day');
                }
            }

            if (typeof options.maxDate == 'object') {
                if (options.maxDate instanceof Date) {
                    this.maxDate = moment(options.maxDate).endOf('day');
                } else {
                    this.maxDate = options.maxDate.endOf('day');
                }
            }

            if (typeof options.ranges == 'object') {
                for (var range in options.ranges) {

                    var start = moment(options.ranges[range][0]).startOf('day');
                    var end = moment(options.ranges[range][1]).endOf('day');

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start.isBefore(this.minDate))
                        start = moment(this.minDate);

                    if (this.maxDate && end.isAfter(this.maxDate))
                        end = moment(this.maxDate);

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
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

            if (typeof options.dropdownAdjusts == 'boolean') {
                this.dropdownAdjusts = options.dropdownAdjusts;
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

        if (typeof options == 'undefined' || typeof options.ranges == 'undefined') {
            this.container.find('.calendar').show();
            this.move();
        }

        if (typeof cb == 'function')
            this.cb = cb;

        this.container.addClass('opens' + this.opens);

        //try parse date if in text input
        if (!hasOptions || (typeof options.startDate == 'undefined' && typeof options.endDate == 'undefined')) {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val();
                var split = val.split(this.separator);

                if (split.length == 2) {
                    this.startDate = moment(split[0], this.format).startOf('day');
                    this.endDate = moment(split[1], this.format).endOf('day');
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
            if (!this.showDropdowns || $(e.target).not('select').length)
                e.preventDefault();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator);
            var start = moment(dateString[0], this.format).startOf('day');

            var end = moment(dateString[1], this.format).endOf('day');

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
                this.element.val(this.cleared ? '' : this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            }
            var arg1 = (this.cleared ? null : this.startDate),
                arg2 = (this.cleared ? null : this.endDate);
            this.cleared = false;
            this.cb(arg1, arg2);
        },

        move: function () {
            var minWidth = $(this.container).find('.ranges').outerWidth();
            if ($(this.container).find('.calendar').is(':visible')) {
                var padding = 24; // FIXME: this works for the default styling, but isn't flexible
                minWidth += $(this.container).find('.calendar').outerWidth() * 2 + padding;
            }
            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight(),
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto',
                    'min-width': minWidth
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight(),
                    left: this.element.offset().left,
                    right: 'auto',
                    'min-width': minWidth
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
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

            this.element.trigger('shown', {target: e.target, picker: this});

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
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
            }
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.container.find('.calendar').show();
                this.move();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
                this.updateCalendars();

                this.changed = true;

                this.container.find('.calendar').hide();
                this.move();
                this.hide();
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract('month', 1);
            } else {
                this.rightCalendar.month.subtract('month', 1);
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add('month', 1);
            } else {
                this.rightCalendar.month.add('month', 1);
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }

        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                var startDate = this.leftCalendar.calendar[row][col];
                var endDate = this.endDate;
                if (typeof this.dateLimit == 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).endOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
                this.element.trigger('clicked', {
                    dir: 'left',
                    picker: this
                });
            } else {
                var startDate = this.startDate;
                var endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit == 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
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

            if (startDate.isSame(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass('active');
                if (!startDate.isSame(this.startDate) || !endDate.isSame(this.endDate))
                    this.changed = true;
                this.startDate = startDate;
                this.endDate = endDate;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass('active');
                this.changed = true;
                this.startDate = startDate;
                this.endDate = moment(startDate).add('day', 1).endOf('day');
            }

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
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

        updateYear: function (e) {
            var year = parseInt($(e.target).val());
            var isLeft = $(e.target).closest('.calendar').hasClass('left');

            if (isLeft) {
                this.leftCalendar.month.month(this.startDate.month()).year(year);
            } else {
                this.rightCalendar.month.month(this.endDate.month()).year(year);
            }

            this.updateCalendars();
        },

        updateMonth: function (e) {
            var month = parseInt($(e.target).val());
            var isLeft = $(e.target).closest('.calendar').hasClass('left');

            if (isLeft) {
                this.leftCalendar.month.month(month).year(this.startDate.year());
            } else {
                this.rightCalendar.month.month(month).year(this.endDate.year());
            }
            this.updateCalendars();
        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), 'right');
            this.container.find('.calendar.left').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find('.calendar.right').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));

            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                    customRange = false;
                    this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                }
                i++;
            }
            if (customRange)
                this.container.find('.ranges li:last').addClass('active');

            this.element.trigger('updated', this);
        },

        buildCalendar: function (month, year, side) {

            var firstDay = moment([year, month, 1]);
            var lastMonth = moment(firstDay).subtract('month', 1).month();
            var lastYear = moment(firstDay).subtract('month', 1).year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate;
            if (side == 'right') {
                curDate = moment([lastYear, lastMonth, startDay]).endOf('day');
            } else {
                curDate = moment([lastYear, lastMonth, startDay]).startOf('day');
            }
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add('day', 1)) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate;
            }

            return calendar;

        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
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

            if (!minDate || minDate.isBefore(calendar[1][1])) {
                html += '<th class="prev available"><i class="icon-arrow-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" style="width: auto">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar[1][1])) {
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
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate)) || (maxDate && calendar[row][col].isAfter(maxDate))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].isSame(selected)) {
                        cname += ' active ';
                        if (calendar[row][col].isSame(this.startDate)) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].isSame(this.endDate)) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            return html;

        }

    };

    $.fn.daterangepicker = function (options, cb) {
        this.each(function () {
            var el = $(this);
            if (!el.data('daterangepicker'))
                el.data('daterangepicker', new DateRangePicker(el, options, cb));
        });
        return this;
    };

}(window.jQuery);

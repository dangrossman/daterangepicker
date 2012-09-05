/**
* @version: 1.0
* @author: Dan Grossman http://www.dangrossman.info/
* @date: 2012-08-20
* @copyright: Copyright (c) 2012 Dan Grossman. All rights reserved.
* @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
* @website: http://www.improvely.com/
*/
!function ($) {

    function equals(date1, date2) {
        return (date1 < date2) ? false : (date1 > date2) ? false : true;
    }

    var DateRangePicker = function (element, options, cb) {
        var hasOptions = typeof options == 'object'
        var localeObject;

        //state
        this.startDate = moment().startOf('day');
        this.endDate = moment().startOf('day');
        this.changed = false;
        this.ranges = {};
        this.opens = 'right';
        this.cb = function () { };
        this.format = 'MM/DD/YYYY';
        this.locale = {
            applyLabel:"Apply",
            fromLabel:"From",
            toLabel:"To",
            customRangeLabel:"Custom Range",
            daysOfWeek:['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa']
        };

        localeObject = this.locale;

        this.leftCalendar = {
            month: moment(this.startDate).startOf('month'),
            calendar: Array()
        };

        this.rightCalendar = {
            month: moment(this.endDate).startOf('month'),
            calendar: Array()
        };

        //element that triggered the date range picker
        this.element = $(element);

        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        if (this.element.is('input')) {
            this.element.on({
                click: $.proxy(this.show, this),
                focus: $.proxy(this.show, this),
                blur: $.proxy(this.hide, this)
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
        }

        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar left"></div>' +
                '<div class="calendar right"></div>' +
                '<div class="ranges">' +
                  '<div class="range_inputs">' +
                    '<div style="float: left">' +
                      '<label for="daterangepicker_start">' + this.locale.fromLabel + '</label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
                    '</div>' +
                    '<div style="float: left; padding-left: 12px">' +
                      '<label for="daterangepicker_end">' + this.locale.toLabel + '</label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
                    '</div>' +
                    '<button class="btn btn-small btn-success" disabled="disabled">' + this.locale.applyLabel + '</button>' +
                  '</div>' +
                '</div>' +
              '</div>';

        //the date range picker
        this.container = $(DRPTemplate).appendTo('body');


        if (hasOptions) {
            if (typeof options.ranges == 'object') {
                for (var range in options.ranges) {

                    var start = options.ranges[range][0];
                    var end = options.ranges[range][1];

                    if (typeof start == 'string')
                        start = Date.parse(start);
                    if (typeof end == 'string')
                        end = Date.parse(end);

                    this.ranges[range] = [moment(start).startOf('day'), moment(end).startOf('day')];
                }

                var list = '<ul>';
                for (var range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                this.container.find('.ranges').prepend(list);
            }

            if (typeof options.format == 'string')
                this.format = options.format;

            if (typeof options.startDate == 'string')
                this.startDate = moment(Date.parse(options.startDate, this.format));

            if (typeof options.endDate == 'string')
                this.endDate = moment(Date.parse(options.endDate, this.format));


            if (typeof options.opens == 'string')
                this.opens = options.opens;
        }

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

        //event listeners
        this.container.on('mousedown', $.proxy(this.mousedown, this));
        this.container.find('.calendar').on('click', '.prev', $.proxy(this.clickPrev, this));
        this.container.find('.calendar').on('click', '.next', $.proxy(this.clickNext, this));
        this.container.find('.ranges').on('click', 'button', $.proxy(this.clickApply, this));

        this.container.find('.calendar').on('click', 'td', $.proxy(this.clickDate, this));
        this.container.find('.calendar').on('mouseenter', 'td', $.proxy(this.enterDate, this));
        this.container.find('.calendar').on('mouseleave', 'td', $.proxy(this.updateView, this));

        this.container.find('.ranges').on('click', 'li', $.proxy(this.clickRange, this));
        this.container.find('.ranges').on('mouseenter', 'li', $.proxy(this.enterRange, this));
        this.container.find('.ranges').on('mouseleave', 'li', $.proxy(this.updateView, this));

        this.element.on('keyup', $.proxy(this.updateFromControl, this));

        this.updateView();
        this.updateCalendars();

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        mousedown: function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (equals(this.startDate, this.endDate) || this.startDate < this.endDate) {
                this.container.find('button').removeAttr('disabled');
            } else {
                this.container.find('button').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;

            var dateString = this.element.val().split(" - ");
            var start = moment(Date.parseExact(dateString[0], this.format));
            var end = moment(Date.parseExact(dateString[1], this.format));

            if (start == null || end == null) return;
            if (end < start) return;

            this.startDate = start;
            this.endDate = end;

            this.updateView();
            this.cb(this.startDate.toDate(), this.endDate.toDate());
            this.updateCalendars();
        },

        notify: function () {
            this.updateView();

            if (this.element.is('input')) {
                this.element.val(this.startDate.format(this.format) + ' - ' + this.endDate.format(this.format));
            }
            this.cb(this.startDate.toDate(), this.endDate.toDate());
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

            $(document).on('mousedown', $.proxy(this.hide, this));
        },

        hide: function (e) {
            this.container.hide();
            $(document).off('mousedown', this.hide);

            if (this.changed)
                this.notify();
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
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
                this.updateCalendars();

                this.changed = true;

                this.container.find('.calendar').hide();
                this.hide();
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract('months', 1);
            } else {
                this.rightCalendar.month.subtract('months', 1);
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add('months', 1);
            } else {
                this.rightCalendar.month.add('months', 1);
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('title');
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
            var title = $(e.target).attr('title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                startDate = this.leftCalendar.calendar[row][col];
                endDate = this.endDate;
            } else {
                startDate = this.startDate;
                endDate = this.rightCalendar.calendar[row][col];
            }

            cal.find('td').removeClass('active');

            if (equals(startDate, endDate) || startDate < endDate) {
                $(e.target).addClass('active');
                if (!equals(startDate, this.startDate) || !equals(endDate, this.endDate))
                    this.changed = true;
                this.startDate = startDate;
                this.endDate = endDate;
            }
        },

        clickApply: function (e) {
            this.hide();
        },

        updateCalendars: function () {

            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year());
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year());
            this.container.find('.calendar.left').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate));
            this.container.find('.calendar.right').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate));

        },

        buildCalendar: function (month, year) {

            var firstDay = moment(new Date(year, month));
            var lastMonth = moment(firstDay).subtract('days', 1).month();
            var lastYear = moment(firstDay).subtract('days', 1).year();

            var daysInMonth = firstDay.daysInMonth();
            var daysInLastMonth = moment(new Date(lastYear, lastMonth)).daysInMonth();

            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = Array();
            for (var i = 0; i < 6; i++) {
                calendar[i] = Array();
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + 1;
            if (dayOfWeek == 0)
                startDay = daysInLastMonth - 6;

            var curDate = moment(new Date(lastYear, lastMonth, startDay));
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add('days', 1)) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate;
            }

            return calendar;

        },

        renderCalendar: function (calendar, selected) {

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';
            html += '<th class="prev"><i class="icon-arrow-left"></i></th>';
            html += '<th colspan="5">' + calendar[1][1].format("MMMM YYYY") + '</th>';
            html += '<th class="next"><i class="icon-arrow-right"></i></th>';
            html += '</tr>';
            html += '<tr>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';
                for (var col = 0; col < 7; col++) {
                    var cname = (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';
                    if (equals(calendar[row][col], selected))
                        cname = 'active';
                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname + '" title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            return html;

        }

    };

    $.fn.daterangepicker = function (options, cb) { new DateRangePicker(this, options, cb); };

} (window.jQuery);
/**
 * @version: 2.1.20
 * @author: Dan Grossman http://www.dangrossman.info/
 * @copyright: Copyright (c) 2012-2015 Dan Grossman. All rights reserved.
 * @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
 */

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['moment', 'jquery', 'exports'], function(momentjs, $, exports) {
      root.daterangepicker = factory(root, exports, momentjs, $);
    });

  } else if (typeof exports !== 'undefined') {
    var momentjs = require('moment');
    var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;  //isomorphic issue
    if (!jQuery) {
      try {
        jQuery = require('jquery');
        if (!jQuery.fn) jQuery.fn = {}; //isomorphic issue
      } catch (err) {
        if (!jQuery) throw new Error('jQuery dependency not found');
      }
    }

    factory(root, exports, momentjs, jQuery);

    // Finally, as a browser global.
  } else {
    root.daterangepicker = factory(root, {}, root.moment || moment, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this || {}, function(root, daterangepicker, moment, $) { // 'this' doesn't exist on a server

  var DateRangePicker = function(element, options, cb) {

    //default settings for options
    this.parentEl = 'body';
    this.element = $(element);
    this.startDate = moment().startOf('day');
    this.endDate = moment().endOf('day');
    this.minDate = false;
    this.maxDate = false;
    this.dateLimit = false;
    this.autoApply = false;
    this.singleDatePicker = false;
    this.showWeekNumbers = false;
    this.autoUpdateInput = true;
    this.ranges = {};
    this.numberOfMonths = 2;

    this.opens = 'right';
    if (this.element.hasClass('pull-right'))
      this.opens = 'left';

    this.drops = 'down';
    if (this.element.hasClass('dropup'))
      this.drops = 'up';

    this.buttonClasses = 'btn btn-sm';
    this.applyClass = 'btn-success';
    this.cancelClass = 'btn-default';

    this.locale = {
      format: 'MM/DD/YYYY',
      separator: ' - ',
      applyLabel: 'Apply',
      cancelLabel: 'Cancel',
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek()
    };

    this.callback = function() { };

    //some state information
    this.isShowing = false;
    this.calendars = [];

    //custom options from user
    if (typeof options !== 'object' || options === null)
      options = {};

    //allow setting options with data attributes
    //data-api options will be overwritten with custom javascript options
    options = $.extend(this.element.data(), options);

    //html template for the picker UI
    if (typeof options.template !== 'string' && !(options.template instanceof jQuery))

      options.template = '<div class="daterangepicker dropdown-menu">' +
        '<div class="daterangepicker_inputs">' +
          '<div class="daterangepicker_input">' +
            '<input class="input-mini" type="text" name="daterangepicker_start" value="" />' +
            '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
            '<div class="calendar-time">' +
              '<div></div>' +
              '<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
            '</div>' +
          '</div>' +
          '<div class="daterangepicker_input">' +
            '<input class="input-mini" type="text" name="daterangepicker_end" value="" />' +
            '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
            '<div class="calendar-time">' +
              '<div></div>' +
              '<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '<div class="calendars">' +
      '</div>' +
      '<div class="ranges">' +
        '<div class="range_inputs">' +
          '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
          '<button class="cancelBtn" type="button"></button>' +
        '</div>' +
      '</div>' +
    '</div>';

      this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
      this.container = $(options.template).appendTo(this.parentEl);

      this.triggerElements = this.element;
      if (options.triggerElements && $(options.triggerElements).length) {
        this.triggerElements = $(options.triggerElements);
      }

      this.startDateInput = this.container.find('input[name="daterangepicker_start"]');
      if (options.startDateInput && $(options.startDateInput).length) {
        this.startDateInput = $(options.startDateInput);
      }

      this.endDateInput = this.container.find('input[name="daterangepicker_end"]');
      if (options.endDateInput && $(options.endDateInput).length) {
        this.endDateInput = $(options.endDateInput);
      }

      //
      // handle all the possible options overriding defaults
      //

      if (typeof options.locale === 'object') {

        if (typeof options.locale.format === 'string')
          this.locale.format = options.locale.format;

        if (typeof options.locale.separator === 'string')
          this.locale.separator = options.locale.separator;

        if (typeof options.locale.daysOfWeek === 'object')
          this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

        if (typeof options.locale.monthNames === 'object')
          this.locale.monthNames = options.locale.monthNames.slice();

        if (typeof options.locale.firstDay === 'number')
          this.locale.firstDay = options.locale.firstDay;

        if (typeof options.locale.applyLabel === 'string')
          this.locale.applyLabel = options.locale.applyLabel;

        if (typeof options.locale.cancelLabel === 'string')
          this.locale.cancelLabel = options.locale.cancelLabel;

        if (typeof options.locale.weekLabel === 'string')
          this.locale.weekLabel = options.locale.weekLabel;

        if (typeof options.locale.customRangeLabel === 'string')
          this.locale.customRangeLabel = options.locale.customRangeLabel;

      }

      if (typeof options.numberOfMonths === 'number')
        this.numberOfMonths = options.numberOfMonths;

      if (typeof options.startDate === 'string')
        this.startDate = moment(options.startDate, this.locale.format);

      if (typeof options.endDate === 'string')
        this.endDate = moment(options.endDate, this.locale.format);

      if (typeof options.minDate === 'string')
        this.minDate = moment(options.minDate, this.locale.format);

      if (typeof options.maxDate === 'string')
        this.maxDate = moment(options.maxDate, this.locale.format);

      if (typeof options.startDate === 'object')
        this.startDate = moment(options.startDate);

      if (typeof options.endDate === 'object')
        this.endDate = moment(options.endDate);

      if (typeof options.minDate === 'object')
        this.minDate = moment(options.minDate);

      if (typeof options.maxDate === 'object')
        this.maxDate = moment(options.maxDate);

      // sanity check for bad options
      if (this.minDate && this.startDate.isBefore(this.minDate))
        this.startDate = this.minDate.clone();

      // sanity check for bad options
      if (this.maxDate && this.endDate.isAfter(this.maxDate))
        this.endDate = this.maxDate.clone();

      if (typeof options.applyClass === 'string')
        this.applyClass = options.applyClass;

      if (typeof options.cancelClass === 'string')
        this.cancelClass = options.cancelClass;

      if (typeof options.dateLimit === 'object')
        this.dateLimit = options.dateLimit;

      if (typeof options.opens === 'string')
        this.opens = options.opens;

      if (typeof options.drops === 'string')
        this.drops = options.drops;

      if (typeof options.showWeekNumbers === 'boolean')
        this.showWeekNumbers = options.showWeekNumbers;

      if (typeof options.buttonClasses === 'string')
        this.buttonClasses = options.buttonClasses;

      if (typeof options.buttonClasses === 'object')
        this.buttonClasses = options.buttonClasses.join(' ');

      if (typeof options.singleDatePicker === 'boolean') {
        this.singleDatePicker = options.singleDatePicker;
        if (this.singleDatePicker)
          this.endDate = this.startDate.clone();
      }

      if (typeof options.autoApply === 'boolean')
        this.autoApply = options.autoApply;

      if (typeof options.autoUpdateInput === 'boolean')
        this.autoUpdateInput = options.autoUpdateInput;

      if (typeof options.isInvalidDate === 'function')
        this.isInvalidDate = options.isInvalidDate;

      // update day names order to firstDay
      if (this.locale.firstDay != 0) {
        var iterator = this.locale.firstDay;
        while (iterator > 0) {
          this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
          iterator--;
        }
      }

      var start, end, range;

      //if no start/end dates set, check if an input element contains initial values
      if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
        if ($(this.element).is('input[type=text]')) {
          var val = $(this.element).val(),
            split = val.split(this.locale.separator);

            start = end = null;

            if (split.length == 2) {
              start = moment(split[0], this.locale.format);
              end = moment(split[1], this.locale.format);
            } else if (this.singleDatePicker && val !== "") {
              start = moment(val, this.locale.format);
              end = moment(val, this.locale.format);
            }
            if (start !== null && end !== null) {
              this.setStartDate(start);
              this.setEndDate(end);
            }
        }
      }

      if (typeof options.ranges === 'object') {
        for (range in options.ranges) {

          if (typeof options.ranges[range][0] === 'string')
            start = moment(options.ranges[range][0], this.locale.format);
          else
            start = moment(options.ranges[range][0]);

          if (typeof options.ranges[range][1] === 'string')
            end = moment(options.ranges[range][1], this.locale.format);
          else
            end = moment(options.ranges[range][1]);

          // If the start or end date exceed those allowed by the minDate or dateLimit
          // options, shorten the range to the allowable period.
          if (this.minDate && start.isBefore(this.minDate))
            start = this.minDate.clone();

          var maxDate = this.maxDate;
          if (this.dateLimit && start.clone().add(this.dateLimit).isAfter(maxDate))
            maxDate = start.clone().add(this.dateLimit);
          if (maxDate && end.isAfter(maxDate))
            end = maxDate.clone();

          // If the end of the range is before the minimum or the start of the range is
          // after the maximum, don't display this range option at all.
          if ((this.minDate && end.isBefore(this.minDate)) || (maxDate && start.isAfter(maxDate)))
            continue;

          //Support unicode chars in the range names.
          var elem = document.createElement('textarea');
          elem.innerHTML = range;
          var rangeHtml = elem.value;

          this.ranges[rangeHtml] = [start, end];
        }

        var list = '<ul>';
        for (range in this.ranges) {
          list += '<li>' + range + '</li>';
        }
        list += '<li>' + this.locale.customRangeLabel + '</li>';
        list += '</ul>';
        this.container.find('.ranges').prepend(list);
      }

      if (typeof cb === 'function') {
        this.callback = cb;
      }

      this.startDate = this.startDate.startOf('day');
      this.endDate = this.endDate.endOf('day');
      this.container.find('.calendar-time').hide();

      //can't be used together for now
      if (this.autoApply)
        this.autoApply = false;

      if (this.autoApply && typeof options.ranges !== 'object') {
        this.container.find('.ranges').hide();
      } else if (this.autoApply) {
        this.container.find('.applyBtn, .cancelBtn').addClass('hide');
      }

      if (this.singleDatePicker) {
        this.container.addClass('single');
        this.container.find('.calendar.left').addClass('single');
        this.container.find('.calendar.left').show();
        this.container.find('.calendar.right').hide();
        this.container.find('.daterangepicker_input input, .daterangepicker_input i').hide();
        this.container.find('.ranges').hide();
      }

      if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
        this.container.addClass('show-calendar');
      }

      this.container.addClass('opens' + this.opens);

      //swap the position of the predefined ranges if opens right
      // if (typeof options.ranges !== 'undefined' && this.opens == 'right') {
        // var ranges = this.container.find('.ranges');
        // var html = ranges.clone();
        // ranges.remove();
        // this.container.find('.calendar.left').parent().prepend(html);
      // }

      //apply CSS classes and labels to buttons
      this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
      if (this.applyClass.length)
        this.container.find('.applyBtn').addClass(this.applyClass);
      if (this.cancelClass.length)
        this.container.find('.cancelBtn').addClass(this.cancelClass);
      this.container.find('.applyBtn').html(this.locale.applyLabel);
      this.container.find('.cancelBtn').html(this.locale.cancelLabel);

      //
      // event listeners
      //

      this.container.find('.calendars')
        .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
        .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
        .on('click.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
        .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
        .on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
        .on('click.daterangepicker', '.daterangepicker_input input', $.proxy(this.showCalendars, this));

      this.container.find('.daterangepicker_inputs')
        //.on('keyup.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this))
        .on('change.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this));

      this.container.find('.ranges')
        .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
        .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
        .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
        .on('mouseenter.daterangepicker', 'li', $.proxy(this.hoverRange, this))
        .on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));

      this.triggerElements.each($.proxy(function(index, trigger) {
        if (trigger === this.element.get(0) && this.element.is('input:enabled:not([readonly])')) {
          $(trigger).on({
            'click.daterangepicker': $.proxy(this.show, this),
            'focus.daterangepicker': $.proxy(this.show, this),
            'keyup.daterangepicker': $.proxy(this.elementChanged, this),
            'keydown.daterangepicker': $.proxy(this.keydown, this)
          });
        } else {
          $(trigger).on('click.daterangepicker', $.proxy(this.toggle, this));
        }
      }, this));

      //
      // if attached to a text input, set the initial value
      //

      if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
        this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
        this.element.trigger('change');
      } else if (this.element.is('input') && this.autoUpdateInput) {
        this.element.val(this.startDate.format(this.locale.format));
        this.element.trigger('change');
      }

  };

  DateRangePicker.prototype = {

    constructor: DateRangePicker,

    setStartDate: function(startDate) {
      if (typeof startDate === 'string')
        this.startDate = moment(startDate, this.locale.format);

      if (typeof startDate === 'object')
        this.startDate = moment(startDate);

      this.startDate = this.startDate.startOf('day');

      if (this.minDate && this.startDate.isBefore(this.minDate))
        this.startDate = this.minDate;

      if (this.maxDate && this.startDate.isAfter(this.maxDate))
        this.startDate = this.maxDate;

      if (!this.isShowing)
        this.updateElement();

      this.updateMonthsInView();
      this.element.trigger('startDateSelected.daterangepicker', this);
    },

    setEndDate: function(endDate) {
      if (typeof endDate === 'string')
        this.endDate = moment(endDate, this.locale.format);

      if (typeof endDate === 'object')
        this.endDate = moment(endDate);

      this.endDate = this.endDate.endOf('day');

      if (this.endDate.isBefore(this.startDate))
        this.endDate = this.startDate.clone();

      if (this.maxDate && this.endDate.isAfter(this.maxDate))
        this.endDate = this.maxDate;

      if (this.dateLimit && this.startDate.clone().add(this.dateLimit).isBefore(this.endDate))
        this.endDate = this.startDate.clone().add(this.dateLimit);

      this.previousRightTime = this.endDate.clone();

      if (!this.isShowing)
        this.updateElement();

      this.updateMonthsInView();
      this.element.trigger('endDateSelected.daterangepicker', this);
    },

    isInvalidDate: function() {
      return false;
    },

    updateView: function() {
      if (this.endDate) {
        this.endDateInput.removeClass('active');
        this.startDateInput.addClass('active');
      } else {
        this.endDateInput.addClass('active');
        this.startDateInput.removeClass('active');
      }
      this.updateMonthsInView();
      this.updateCalendars();
      this.updateFormInputs();
    },

    updateMonthsInView: function() {
      var months = $.map(this.calendars, function(calendar) {
        return calendar.month.format('YYYY-MM');
      });

      var initMonths = false;
      if (this.endDate) {
        //if both dates are visible already, do nothing
        if (!this.singleDatePicker && months.length &&
            months.indexOf(this.startDate.format('YYYY-MM')) > -1 &&
            months.indexOf(this.endDate.format('YYYY-MM')) > -1
           ) {
             return;
           }
        initMonths = true;
      } else if (months.indexOf(this.startDate.format('YYYY-MM')) === -1) {
        initMonths = true;
      }

      if (initMonths) {
        this.calendars = [];
        for (var i = 0; i < this.numberOfMonths; i++) {
          this.calendars.push({
            month: this.startDate.clone().date(2).add(i, 'month')
          })
        }
      }
    },

    updateCalendars: function() {

      this.container.find('.calendars').html('');
      for (var index in this.calendars) {
        this.renderCalendar(index);
      }

      //highlight any predefined range matching the current start and end dates
      this.container.find('.ranges li').removeClass('active');
      this.element.trigger('updateCalendar.daterangepicker', this);

      if (this.endDate == null) return;

      var customRange = true;
      var i = 0;
      for (var range in this.ranges) {
        //ignore times when comparing dates if time picker is not enabled
        if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
          customRange = false;
          this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
          break;
        }
        i++;
      }
      if (customRange) {
        this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
        this.showCalendars();
      }

    },

    renderCalendar: function(index) {

      //
      // Build the matrix of dates that will populate the calendar
      //

      var calendar = this.calendars[index];
      var month = calendar.month.month();
      var year = calendar.month.year();
      var hour = calendar.month.hour();
      var minute = calendar.month.minute();
      var second = calendar.month.second();
      var daysInMonth = moment([year, month]).daysInMonth();
      var firstDay = moment([year, month, 1]);
      var lastDay = moment([year, month, daysInMonth]);
      var lastMonth = moment(firstDay).subtract(1, 'month').month();
      var lastYear = moment(firstDay).subtract(1, 'month').year();
      var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
      var dayOfWeek = firstDay.day();

      calendar.firstDay = firstDay;
      calendar.lastDay = lastDay;

      //initialize a 6 rows x 7 columns array for the calendar
      var calMatrix = [];

      for (var i = 0; i < 6; i++) {
        calMatrix[i] = [];
      }

      //populate the calMatrix with date objects
      var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
      if (startDay > daysInLastMonth)
        startDay -= 7;

      if (dayOfWeek == this.locale.firstDay)
        startDay = daysInLastMonth - 6;

      var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

      var col, row;
      for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
        if (i > 0 && col % 7 === 0) {
          col = 0;
          row++;
        }
        calMatrix[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
        curDate.hour(12);

        if (this.minDate && calMatrix[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calMatrix[row][col].isBefore(this.minDate) && index == 0) {
          calMatrix[row][col] = this.minDate.clone();
        }

        if (this.maxDate && calMatrix[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calMatrix[row][col].isAfter(this.maxDate) && index == this.numberOfMonths - 1) {
          calMatrix[row][col] = this.maxDate.clone();
        }

      }

      //make the calendar object available to hoverDate/clickDate
      calendar.calendar = calMatrix;

      //
      // Display the calendar
      //

      var minDate = index == 0 ? this.minDate : this.startDate;
      var maxDate = this.maxDate;
      var selected = index == 0 ? this.startDate : this.endDate;

      var html = '<div class="calendar">';
      html += '<div class="calendar-table">';
      html += '<table class="table-condensed">';
      html += '<thead>';
      html += '<tr>';

      // add empty cell for week number
      if (this.showWeekNumbers)
        html += '<th></th>';

      if ((!minDate || minDate.isBefore(calendar.firstDay)) && index == 0) {
        html += '<th class="prev available"><i class="fa fa-chevron-left glyphicon glyphicon-chevron-left"></i></th>';
      } else {
        html += '<th></th>';
      }

      var dateHtml = this.locale.monthNames[calMatrix[1][1].month()] + calMatrix[1][1].format(" YYYY");

      html += '<th colspan="5" class="month">' + dateHtml + '</th>';
      if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (index == this.numberOfMonths - 1 || this.singleDatePicker)) {
        html += '<th class="next available"><i class="fa fa-chevron-right glyphicon glyphicon-chevron-right"></i></th>';
      } else {
        html += '<th></th>';
      }

      html += '</tr>';
      html += '<tr>';

      // add week number label
      if (this.showWeekNumbers)
        html += '<th class="week">' + this.locale.weekLabel + '</th>';

      $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
        html += '<th>' + dayOfWeek + '</th>';
      });

      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

      //adjust maxDate to reflect the dateLimit setting in order to
      //grey out end dates beyond the dateLimit
      if (this.endDate == null && this.dateLimit) {
        var maxLimit = this.startDate.clone().add(this.dateLimit).endOf('day');
        if (!maxDate || maxLimit.isBefore(maxDate)) {
          maxDate = maxLimit;
        }
      }

      for (var row = 0; row < 6; row++) {
        html += '<tr>';

        // add week number
        if (this.showWeekNumbers)
          html += '<td class="week">' + calMatrix[row][0].week() + '</td>';

        for (var col = 0; col < 7; col++) {

          var classes = [];

          //highlight today's date
          if (calMatrix[row][col].isSame(new Date(), "day"))
            classes.push('today');

          //highlight weekends
          if (calMatrix[row][col].isoWeekday() > 5)
            classes.push('weekend');

          //grey out the dates in other months displayed at beginning and end of this calMatrix
          if (calMatrix[row][col].month() != calMatrix[1][1].month())
            classes.push('off');

          //don't allow selection of dates before the minimum date
          if (this.minDate && calMatrix[row][col].isBefore(this.minDate, 'day'))
            classes.push('off', 'disabled');

          //don't allow selection of dates after the maximum date
          if (maxDate && calMatrix[row][col].isAfter(maxDate, 'day'))
            classes.push('off', 'disabled');

          //don't allow selection of date if a custom function decides it's invalid
          if (this.isInvalidDate(calMatrix[row][col]))
            classes.push('off', 'disabled');

          //highlight the currently selected start date
          if (calMatrix[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD'))
            classes.push('active', 'start-date');

          //highlight the currently selected end date
          if (this.endDate != null && calMatrix[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD'))
            classes.push('active', 'end-date');

          //highlight dates in-between the selected dates
          if (this.endDate != null && calMatrix[row][col] > this.startDate && calMatrix[row][col] < this.endDate)
            classes.push('in-range');

          var cname = '', disabled = false;
          for (var i = 0; i < classes.length; i++) {
            cname += classes[i] + ' ';
            if (classes[i] == 'disabled')
              disabled = true;
          }
          if (!disabled)
            cname += 'available';

          html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '" data-date="' + calMatrix[row][col].format('YYYY-MM-DD') + '">' + calMatrix[row][col].date() + '</td>';

        }
        html += '</tr>';
      }

      html += '</tbody>';
      html += '</table>';
      html += '</div>';
      html += '</div>';

      this.container.find('.calendars').append(html);
      this.container.find('.calendars .calendar').last().data('calendar', calendar);
    },

    updateFormInputs: function() {

      //ignore mouse movements while an above-calendar text input has focus
      if (this.startDateInput.is(":focus") || this.endDateInput.is(":focus"))
        return;

      this.startDateInput.val(this.startDate.format(this.locale.format));
      if (this.endDate)
        this.endDateInput.val(this.endDate.format(this.locale.format));

      if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
        this.container.find('button.applyBtn').removeAttr('disabled');
      } else {
        this.container.find('button.applyBtn').attr('disabled', 'disabled');
      }

    },

    move: function() {
      var parentOffset = { top: 0, left: 0 },
        containerTop;
        var parentRightEdge = $(window).width();
        if (!this.parentEl.is('body')) {
          parentOffset = {
            top: this.parentEl.offset().top - this.parentEl.scrollTop(),
            left: this.parentEl.offset().left - this.parentEl.scrollLeft()
          };
          parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
        }

        if (this.drops == 'up')
          containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
        else
          containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
        this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

        if (this.opens == 'left') {
          this.container.css({
            top: containerTop,
            right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
            left: 'auto'
          });
          if (this.container.offset().left < 0) {
            this.container.css({
              right: 'auto',
              left: 9
            });
          }
        } else if (this.opens == 'center') {
          this.container.css({
            top: containerTop,
            left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
            - this.container.outerWidth() / 2,
            right: 'auto'
          });
          if (this.container.offset().left < 0) {
            this.container.css({
              right: 'auto',
              left: 9
            });
          }
        } else {
          this.container.css({
            top: containerTop,
            left: this.element.offset().left - parentOffset.left,
            right: 'auto'
          });
          if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
            this.container.css({
              left: 'auto',
              right: 0
            });
          }
        }
    },

    show: function(e) {
      if (this.isShowing) return;

      // Create a click proxy that is private to this instance of datepicker, for unbinding
      this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);

      // Bind global datepicker mousedown for hiding and
      $(document)
      // also support mobile devices
      .on('touchend.daterangepicker', this._outsideClickProxy)
      // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
      .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
      // and also close when focus changes to outside the picker (eg. tabbing between controls)
      .on('focusin.daterangepicker', this._outsideClickProxy);

      // Reposition the picker if the window is resized while it's open
      $(window).on('resize.daterangepicker', $.proxy(function(e) { this.move(e); }, this));

      this.oldStartDate = this.startDate.clone();
      this.oldEndDate = this.endDate.clone();
      this.previousRightTime = this.endDate.clone();

      this.updateView();
      this.container.show();
      this.move();
      this.element.trigger('show.daterangepicker', this);
      this.isShowing = true;
    },

    hide: function(e) {
      if (!this.isShowing) return;

      //incomplete date selection, revert to last values
      if (!this.endDate) {
        this.startDate = this.oldStartDate.clone();
        this.endDate = this.oldEndDate.clone();
      }

      //if a new date range was selected, invoke the user callback function
      if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
        this.callback(this.startDate, this.endDate, this.chosenLabel);

      //if picker is attached to a text input, update it
      this.updateElement();

      $(document).off('.daterangepicker');
      $(window).off('.daterangepicker');
      this.container.hide();
      this.element.trigger('hide.daterangepicker', this);
      this.isShowing = false;
    },

    toggle: function(e) {
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    },

    outsideClick: function(e) {
      var target = $(e.target);
      // if the page is clicked anywhere except within the daterangerpicker/button
      // itself then call this.hide()
      if (
        // ie modal dialog fix
        e.type == "focusin" ||
          target.closest(this.triggerElements).length ||
            target.closest(this.container).length ||
              target.closest('.calendar-table').length
      ) return;
      this.hide();
    },

    showCalendars: function() {
      this.container.addClass('show-calendar');
      this.move();
      this.element.trigger('showCalendar.daterangepicker', this);
    },

    hideCalendars: function() {
      this.container.removeClass('show-calendar');
      this.element.trigger('hideCalendar.daterangepicker', this);
    },

    hoverRange: function(e) {

      //ignore mouse movements while an above-calendar text input has focus
      if (this.startDateInput.is(":focus") || this.endDateInput.is(":focus"))
        return;

      var label = e.target.innerHTML;
      if (label == this.locale.customRangeLabel) {
        this.updateView();
      } else {
        var dates = this.ranges[label];
        this.startDateInput.val(dates[0].format(this.locale.format));
        this.endDateInput.val(dates[1].format(this.locale.format));
      }

    },

    clickRange: function(e) {
      var label = e.target.innerHTML;
      this.chosenLabel = label;
      if (label == this.locale.customRangeLabel) {
        this.showCalendars();
      } else {
        var dates = this.ranges[label];
        this.startDate = dates[0];
        this.endDate = dates[1];

        this.startDate.startOf('day');
        this.endDate.endOf('day');

        this.hideCalendars();
        this.clickApply();
      }
    },

    clickPrev: function() {
      for (var index in this.calendars) {
        this.calendars[index].month.subtract(1, 'month');
      }
      this.updateCalendars();
    },

    clickNext: function() {
      for (var index in this.calendars) {
        this.calendars[index].month.add(1, 'month');
      }
      this.updateCalendars();
    },

    hoverDate: function(e) {

      //ignore mouse movements while an above-calendar text input has focus
      if (this.startDateInput.is(":focus") || this.endDateInput.is(":focus"))
        return;

      //ignore dates that can't be selected
      if (!$(e.target).hasClass('available')) return;

      //have the text inputs above calendars reflect the date being hovered over
      var title = $(e.target).attr('data-title');
      var row = title.substr(1, 1);
      var col = title.substr(3, 1);
      var cal = $(e.target).parents('.calendar');
      var date = cal.data('calendar').calendar[row][col];

      if (this.endDate) {
        this.startDateInput.val(date.format(this.locale.format));
      } else {
        this.endDateInput.val(date.format(this.locale.format));
      }

      //highlight the dates between the start date and the date being hovered as a potential end date
      var startDate = this.startDate;
      if (!this.endDate) {
        this.container.find('.calendar td').each(function(index, el) {

          //skip week numbers, only look at dates
          if ($(el).hasClass('week')) return;

          var title = $(el).attr('data-title');
          var row = title.substr(1, 1);
          var col = title.substr(3, 1);
          var cal = $(el).parents('.calendar');
          var dt = cal.data('calendar').calendar[row][col];

          if (dt.isAfter(startDate) && dt.isBefore(date)) {
            $(el).addClass('in-range');
          } else {
            $(el).removeClass('in-range');
          }

        });
      }

    },

    clickDate: function(e) {

      if (!$(e.target).hasClass('available')) return;

      var title = $(e.target).attr('data-title');
      var row = title.substr(1, 1);
      var col = title.substr(3, 1);
      var cal = $(e.target).parents('.calendar');
      var date = cal.data('calendar').calendar[row][col];

      var needApplying = false;

      //
      // this function needs to do a few things:
      // * alternate between selecting a start and end date for the range,
      // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
      // * if autoapply is enabled, and an end date was chosen, apply the selection
      // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
      //

      if (this.endDate || date.isBefore(this.startDate, 'day')) {
        this.endDate = null;
        this.setStartDate(date.clone());
      } else if (!this.endDate && date.isBefore(this.startDate)) {
        //special case: clicking the same date for start/end, 
        //but the time of the end date is before the start date
        this.setEndDate(this.startDate.clone());
      } else {
        this.setEndDate(date.clone());
        if (this.autoApply)
          needApplying = true;
      }

      if (this.singleDatePicker) {
        this.setEndDate(this.startDate);
        needApplying = true;
      }

      this.updateView();

      if (needApplying) {
        this.clickApply();
      }
    },

    clickApply: function(e) {
      this.element.trigger('apply.daterangepicker', this);
      this.hide();
    },

    clickCancel: function(e) {
      this.startDate = this.oldStartDate;
      this.endDate = this.oldEndDate;
      this.element.trigger('cancel.daterangepicker', this);
      this.hide();
    },

    formInputsChanged: function(e) {
      var isEndDate = $(e.target).prop('name') === 'daterangepicker_end';
      var start = moment(this.startDateInput.val(), this.locale.format);
      var end = moment(this.endDateInput.val(), this.locale.format);

      if (start.isValid() && end.isValid()) {

        if (isEndDate && end.isBefore(start))
          start = end.clone();

        this.setStartDate(start);
        this.setEndDate(end);

        if (isEndDate) {
          this.startDateInput.val(this.startDate.format(this.locale.format));
        } else {
          this.endDateInput.val(this.endDate.format(this.locale.format));
        }

      }

      this.updateCalendars();
    },

    elementChanged: function() {
      if (!this.element.is('input')) return;
      if (!this.element.val().length) return;
      if (this.element.val().length < this.locale.format.length) return;

      var dateString = this.element.val().split(this.locale.separator),
        start = null,
          end = null;

          if (dateString.length === 2) {
            start = moment(dateString[0], this.locale.format);
            end = moment(dateString[1], this.locale.format);
          }

          if (this.singleDatePicker || start === null || end === null) {
            start = moment(this.element.val(), this.locale.format);
            end = start;
          }

          if (!start.isValid() || !end.isValid()) return;

          this.setStartDate(start);
          this.setEndDate(end);
          this.updateView();
    },

    keydown: function(e) {
      //hide on tab or enter
      if ((e.keyCode === 9) || (e.keyCode === 13)) {
        this.hide();
      }
    },

    updateElement: function() {
      if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
        this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
        this.element.trigger('change');
      } else if (this.element.is('input') && this.autoUpdateInput) {
        this.element.val(this.startDate.format(this.locale.format));
        this.element.trigger('change');
      }
    },

    remove: function() {
      this.container.remove();
      this.element.off('.daterangepicker');
      this.element.removeData();
    },

    updateMomentLocale: function(key) {
      moment.locale(key);
      this.locale.daysOfWeek = moment.weekdaysMin();
      this.locale.monthNames = moment.monthsShort();
      this.locale.firstDay = moment.localeData().firstDayOfWeek;
      for (var attr in this) {
        if (this[attr] && this[attr] instanceof moment().constructor) {
          this[attr].locale(key);
        }
      }
      this.updateView();
      this.updateElement();
    }

  };

  $.fn.daterangepicker = function(options, callback) {
    this.each(function() {
      var el = $(this);
      if (el.data('daterangepicker'))
        el.data('daterangepicker').remove();
      el.data('daterangepicker', new DateRangePicker(el, options, callback));
    });
    return this;
  };

  return DateRangePicker;

}));

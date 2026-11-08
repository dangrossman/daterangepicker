/* Date Range Picker | Copyright Dan Grossman | MIT license */
import { date as standaloneDate } from './dates.js';

const instances = new WeakMap();
let nextInstance = 0;

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

export function createPicker(jquery, date = standaloneDate) {
    let $ = jquery;
    var DateRangePicker = function(element, options, cb) {

        // Defer DOM access so server-rendered applications can import the module.
        if (!$) $ = require('cash-dom/dist/cash.js');

        //default settings for options
        this.parentEl = 'body';
        this.element = $(element).first();
        if (!this.element.length) throw new TypeError('DateRangePicker requires a trigger element');
        const previous = instances.get(this.element[0]);
        if (previous) previous.remove();
        this.eventNamespace = '.daterangepicker.drp' + (++nextInstance);
        this._scrollFrame = null;
        this._onScroll = event => {
            const scroller = event.target;
            if (scroller !== window && scroller !== document &&
                !scroller.contains(this.element[0]) && !scroller.contains(this.container[0])) return;
            if (this._scrollFrame !== null) return;
            this._scrollFrame = window.requestAnimationFrame(() => {
                this._scrollFrame = null;
                this.move();
            });
        };
        this.startDate = date().startOf('day');
        this.endDate = date().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.maxSpan = false;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.minYear = date().subtract(100, 'year').format('YYYY');
        this.maxYear = date().add(100, 'year').format('YYYY');
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.showCustomRangeLabel = true;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.linkedCalendars = true;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.ranges = Object.create(null);

        this.opens = 'right';
        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        this.drops = 'down';
        if (this.element.hasClass('dropup'))
            this.drops = 'up';

        this.buttonClasses = 'btn btn-sm';
        this.applyButtonClasses = 'btn-primary';
        this.cancelButtonClasses = 'btn-default';

        this.locale = {
            direction: 'ltr',
            format: date.localeData().longDateFormat('L'),
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: date.weekdaysMin(),
            monthNames: date.monthsShort(),
            firstDay: date.localeData().firstDayOfWeek()
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;
        this.leftCalendar = {};
        this.rightCalendar = {};

        //custom options from user
        if (typeof options !== 'object' || options === null)
            options = {};

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend({}, this.element.data(), options);

        //html template for the picker UI
        if (typeof options.template !== 'string' && !(options.template && (options.template.nodeType || options.template[0]?.nodeType)))
            options.template =
            '<div class="daterangepicker">' +
                '<div class="ranges"></div>' +
                '<div class="drp-calendar left">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-calendar right">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-buttons">' +
                    '<span class="drp-selected"></span>' +
                    '<button class="cancelBtn" type="button"></button>' +
                    '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                '</div>' +
            '</div>';

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (options.locale && typeof options.locale === 'object') {

            if (typeof options.locale.direction === 'string')
                this.locale.direction = options.locale.direction;

            if (typeof options.locale.format === 'string')
                this.locale.format = options.locale.format;

            if (typeof options.locale.separator === 'string')
                this.locale.separator = options.locale.separator;

            if (Array.isArray(options.locale.daysOfWeek))
                this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

            if (Array.isArray(options.locale.monthNames))
              this.locale.monthNames = options.locale.monthNames.slice();

            if (typeof options.locale.firstDay === 'number')
              this.locale.firstDay = ((Math.floor(options.locale.firstDay) % 7) + 7) % 7;

            if (typeof options.locale.applyLabel === 'string')
              this.locale.applyLabel = options.locale.applyLabel;

            if (typeof options.locale.cancelLabel === 'string')
              this.locale.cancelLabel = options.locale.cancelLabel;

            if (typeof options.locale.weekLabel === 'string')
              this.locale.weekLabel = options.locale.weekLabel;

            if (typeof options.locale.customRangeLabel === 'string'){
                //Support unicode chars in the custom range name.
                var elem = document.createElement('textarea');
                elem.innerHTML = options.locale.customRangeLabel;
                var rangeHtml = elem.value;
                this.locale.customRangeLabel = rangeHtml;
            }
        }
        this.container.addClass(this.locale.direction);

        for (const name of ['startDate', 'endDate', 'minDate', 'maxDate']) {
            if (options[name] == null || options[name] === false) continue;
            const parsed = this.parseDate(options[name]);
            if (parsed.isValid()) this[name] = parsed;
        }
        if (this.minDate && this.startDate.isBefore(this.minDate)) this.startDate = this.minDate.clone();
        if (this.maxDate && this.startDate.isAfter(this.maxDate)) this.startDate = this.maxDate.clone();

        if (typeof options.applyButtonClasses === 'string')
            this.applyButtonClasses = options.applyButtonClasses;

        if (typeof options.applyClass === 'string') //backwards compat
            this.applyButtonClasses = options.applyClass;

        if (typeof options.cancelButtonClasses === 'string')
            this.cancelButtonClasses = options.cancelButtonClasses;

        if (typeof options.cancelClass === 'string') //backwards compat
            this.cancelButtonClasses = options.cancelClass;

        if (typeof options.maxSpan === 'object')
            this.maxSpan = options.maxSpan;

        if (typeof options.dateLimit === 'object') //backwards compat
            this.maxSpan = options.dateLimit;

        if (typeof options.opens === 'string')
            this.opens = options.opens;

        if (typeof options.drops === 'string')
            this.drops = options.drops;

        if (typeof options.showWeekNumbers === 'boolean')
            this.showWeekNumbers = options.showWeekNumbers;

        if (typeof options.showISOWeekNumbers === 'boolean')
            this.showISOWeekNumbers = options.showISOWeekNumbers;

        if (typeof options.buttonClasses === 'string')
            this.buttonClasses = options.buttonClasses;

        if (typeof options.buttonClasses === 'object')
            this.buttonClasses = options.buttonClasses.join(' ');

        if (typeof options.showDropdowns === 'boolean')
            this.showDropdowns = options.showDropdowns;

        if (typeof options.minYear === 'number')
            this.minYear = options.minYear;

        if (typeof options.maxYear === 'number')
            this.maxYear = options.maxYear;

        if (typeof options.showCustomRangeLabel === 'boolean')
            this.showCustomRangeLabel = options.showCustomRangeLabel;

        if (typeof options.singleDatePicker === 'boolean') {
            this.singleDatePicker = options.singleDatePicker;
            if (this.singleDatePicker)
                this.endDate = this.startDate.clone();
        }

        if (typeof options.timePicker === 'boolean')
            this.timePicker = options.timePicker;

        if (typeof options.timePickerSeconds === 'boolean')
            this.timePickerSeconds = options.timePickerSeconds;

        if (Math.floor(options.timePickerIncrement) === options.timePickerIncrement && options.timePickerIncrement > 0 && options.timePickerIncrement <= 60)
            this.timePickerIncrement = options.timePickerIncrement;

        if (typeof options.timePicker24Hour === 'boolean')
            this.timePicker24Hour = options.timePicker24Hour;

        if (typeof options.autoApply === 'boolean')
            this.autoApply = options.autoApply;

        if (typeof options.autoUpdateInput === 'boolean')
            this.autoUpdateInput = options.autoUpdateInput;

        if (typeof options.linkedCalendars === 'boolean')
            this.linkedCalendars = options.linkedCalendars;

        if (typeof options.isInvalidDate === 'function')
            this.isInvalidDate = options.isInvalidDate;

        if (typeof options.isCustomDate === 'function')
            this.isCustomDate = options.isCustomDate;

        if (typeof options.alwaysShowCalendars === 'boolean')
            this.alwaysShowCalendars = options.alwaysShowCalendars;

        // update day names order to firstDay
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                iterator--;
            }
        }

        this.minSpan = !this.singleDatePicker && options.minSpan;
        this.startDate = this.constrainStart(this.startDate);
        this.applyOnRangeClick = options.applyOnRangeClick !== false || (this.autoApply && !this.timePicker);
        var start, end;

        //if no start/end dates set, check if an input element contains initial values
        if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
            if (this.element.is('input') && this.element[0].type === 'text') {
                var val = this.element.val(),
                    split = val.split(this.locale.separator);

                start = end = null;

                if (split.length == 2) {
                    start = date(split[0], this.locale.format);
                    end = date(split[1], this.locale.format);
                } else if (this.singleDatePicker && val !== "") {
                    start = date(val, this.locale.format);
                    end = date(val, this.locale.format);
                }
                if (start && end && start.isValid() && end.isValid()) {
                    this.setStartDate(start);
                    this.setEndDate(end);
                }
            }
        }

        this.endDate = this.constrainEnd(this.startDate, this.endDate);
        this.setRanges(options.ranges);

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.endOf('day');
            this.container.find('.calendar-time').hide();
        }

        //can't be used together for now
        if (this.timePicker && this.autoApply)
            this.autoApply = false;

        if (this.autoApply) {
            this.container.addClass('auto-apply');
        }

        this.singleCalendar = options.singleCalendar === true && !this.singleDatePicker;
        if (this.singleCalendar) {
            this.container.find('.drp-buttons .drp-selected').hide();
            this.container.find('.right .calendar-table').hide();
            if (!this.timePicker) this.container.find('.drp-calendar.right').hide();
        }

        if (this.singleDatePicker) {
            this.container.addClass('single');
            this.container.find('.drp-calendar.left').addClass('single');
            this.container.find('.drp-calendar.left').show();
            this.container.find('.drp-calendar.right').hide();
            if (!this.timePicker && this.autoApply) {
                this.container.addClass('auto-apply');
            }
        }

        if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars) {
            this.container.addClass('show-calendar');
        }

        this.container.addClass('opens' + this.opens);

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyButtonClasses.length)
            this.container.find('.applyBtn').addClass(this.applyButtonClasses);
        if (this.cancelButtonClasses.length)
            this.container.find('.cancelBtn').addClass(this.cancelButtonClasses);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.drp-calendar')
            .on('click' + this.eventNamespace, '.prev', this.clickPrev.bind(this))
            .on('click' + this.eventNamespace, '.next', this.clickNext.bind(this))
            .on('mousedown' + this.eventNamespace, 'td.available', this.clickDate.bind(this))
            .on('mouseenter' + this.eventNamespace, 'td.available', this.hoverDate.bind(this))
            .on('change' + this.eventNamespace, 'select.yearselect', this.monthOrYearChanged.bind(this))
            .on('change' + this.eventNamespace, 'select.monthselect', this.monthOrYearChanged.bind(this))
            .on('change' + this.eventNamespace, 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', this.timeChanged.bind(this));

        this.container.on('keydown' + this.eventNamespace, this.calendarKeydown.bind(this));
        this.container.find('.ranges')
            .on('click' + this.eventNamespace, 'li', this.clickRange.bind(this));

        this.container.find('.drp-buttons')
            .on('click' + this.eventNamespace, 'button.applyBtn', this.clickApply.bind(this))
            .on('click' + this.eventNamespace, 'button.cancelBtn', this.clickCancel.bind(this));

        if (this.element.is('input') || this.element.is('button')) {
            this.element.on({
                ['click' + this.eventNamespace]: this.show.bind(this),
                ['focus' + this.eventNamespace]: this.show.bind(this),
                ['keyup' + this.eventNamespace]: this.elementChanged.bind(this),
                ['keydown' + this.eventNamespace]: this.keydown.bind(this) //IE 11 compatibility
            });
        } else {
            this.element.on('click' + this.eventNamespace, this.toggle.bind(this));
            this.element.on('keydown' + this.eventNamespace, e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }

        //
        // if attached to a text input, set the initial value
        //

        instances.set(this.element[0], this);
        if (jquery) this.element.data('daterangepicker', this);
        this.updateElement();

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setRanges: function(ranges) {
            this.ranges = Object.create(null);
            const list = document.createElement('ul');
            const decoder = document.createElement('textarea');
            const appendLabel = label => {
                const item = document.createElement('li');
                item.dataset.rangeKey = label;
                item.tabIndex = 0;
                item.setAttribute('role', 'button');
                item.textContent = label;
                list.appendChild(item);
            };
            for (const name of Object.keys(ranges || {})) {
                const pair = ranges[name];
                if (!Array.isArray(pair) || pair.length !== 2) continue;
                let [start, end] = pair.map(value => this.parseDate(value));
                if (!start.isValid() || !end.isValid() || end.isBefore(start)) continue;
                const unit = this.timePicker ? 'millisecond' : 'day';
                if ((this.minDate && end.isBefore(this.minDate, unit)) ||
                    (this.maxDate && start.isAfter(this.maxDate, unit))) continue;

                if (this.minDate && start.isBefore(this.minDate)) start = this.minDate.clone();
                if (this.minSpan && this.maxDate && start.clone().add(this.minSpan).isAfter(this.maxDate)) continue;
                end = this.constrainEnd(start, end);
                decoder.innerHTML = name;
                this.ranges[decoder.value] = [start, end];
            }
            const target = this.container.find('.ranges');
            target.find('ul').remove();
            if (ranges) {
                for (const label of Object.keys(this.ranges)) appendLabel(label);
                if (this.showCustomRangeLabel) appendLabel(this.locale.customRangeLabel);
                target.prepend(list);
            }
            this.container.toggleClass('show-ranges', Boolean(ranges));
            if (!ranges) this.container.addClass('show-calendar');
            if (this.isShowing) this.updateView();
        },

        parseDate: function(value) {
            return typeof value === 'string' ? date(value, this.locale.format) : date(value ?? null);
        },

        constrainStart: function(start) {
            if (this.minSpan && this.maxDate && start.clone().add(this.minSpan).isAfter(this.maxDate))
                start = this.maxDate.clone().subtract(this.minSpan);
            if (this.minDate && start.isBefore(this.minDate)) start = this.minDate.clone();
            return start;
        },

        constrainEnd: function(start, end) {
            if (this.minSpan) {
                const earliest = start.clone().add(this.minSpan);
                if (end.isBefore(earliest)) end = earliest;
            }
            if (end.isBefore(start)) end = start.clone();
            if (this.maxSpan) {
                const latest = start.clone().add(this.maxSpan);
                if (end.isAfter(latest)) end = latest;
            }
            if (this.maxDate && end.isAfter(this.maxDate)) end = this.maxDate.clone();
            return end;
        },

        setStartDate: function(startDate) {
            const parsed = this.parseDate(startDate);
            if (!parsed.isValid()) return;
            this.startDate = parsed;

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.minDate && this.startDate.isBefore(this.minDate)) {
                this.startDate = this.minDate.clone();
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.minute(Math.ceil(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
                this.startDate = this.maxDate.clone();
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            this.startDate = this.constrainStart(this.startDate);
            if (this.endDate) {
                this.endDate = this.constrainEnd(this.startDate, this.endDate);
                if (this.singleDatePicker) this.endDate = this.timePicker ? this.startDate.clone() : this.startDate.clone().endOf('day');
            }
            if (!this.isShowing) this.updateElement();
            this.updateMonthsInView();
        },

        setEndDate: function(endDate) {
            const parsed = this.parseDate(endDate);
            if (!parsed.isValid()) return;
            this.endDate = parsed;

            if (!this.timePicker)
                this.endDate = this.endDate.endOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            this.endDate = this.constrainEnd(this.startDate, this.endDate);


            this.container.find('.drp-selected').text(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        isInvalidDate: function() {
            return false;
        },

        isCustomDate: function() {
            return false;
        },

        updateView: function() {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
                if (!this.endDate) {
                    this.container.find('.right .calendar-time select').prop('disabled', true).addClass('disabled');
                } else {
                    this.container.find('.right .calendar-time select').prop('disabled', false).removeClass('disabled');
                }
            }
            this.container.find('.drp-selected').text(this.endDate ? this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format) : this.startDate.format(this.locale.format));
            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        },

        updateMonthsInView: function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleCalendar && !this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    &&
                    (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                } else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }

            } else {
                if (!this.leftCalendar.month.isSame(this.startDate, 'month') && (this.singleCalendar || !this.rightCalendar.month.isSame(this.startDate, 'month'))) {
                    this.leftCalendar.month = this.startDate.clone().date(2);
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
            if (this.maxDate && !this.singleDatePicker && !this.singleCalendar && this.rightCalendar.month.isAfter(this.maxDate, "month")) {
              this.rightCalendar.month = this.maxDate.clone().date(2);
              if (this.linkedCalendars || this.leftCalendar.month.isSame(this.rightCalendar.month, 'month'))
                  this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
        },

        withSelectedTime: function(value, side) {
            const panel = this.container.find('.' + side + ' .calendar-time');
            let hour = parseInt(panel.find('.hourselect').val(), 10);
            const minute = parseInt(panel.find('.minuteselect').val(), 10);
            const second = this.timePickerSeconds ? parseInt(panel.find('.secondselect').val(), 10) : 0;
            if (!isFinite(hour) || !isFinite(minute) || !isFinite(second))
                return value.clone();
            if (!this.timePicker24Hour)
                hour = hour % 12 + (panel.find('.ampmselect').val() === 'PM' ? 12 : 0);
            return value.clone().hour(hour).minute(minute).second(second);
        },

        updateCalendars: function() {
            if (this.timePicker) {
                const side = this.endDate ? 'left' : 'right';
                this.leftCalendar.month = this.withSelectedTime(this.leftCalendar.month, side);
                this.rightCalendar.month = this.withSelectedTime(this.rightCalendar.month, side);
            }

            this.renderCalendar('left');
            this.renderCalendar('right');

            this.emit('calendarRendered');

            //highlight any predefined range matching the current start and end dates
            this.container.find('.ranges li').removeClass('active');
            if (this.endDate == null) return;

            this.calculateChosenLabel();
        },

        renderCalendar: function(side) {

            //
            // Build the matrix of dates that will populate the calendar
            //

            var calendar = side == 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month();
            var year = calendar.month.year();
            var hour = calendar.month.hour();
            var minute = calendar.month.minute();
            var second = calendar.month.second();
            var daysInMonth = date([year, month, 1]).daysInMonth();
            var firstDay = date([year, month, 1]);
            var lastDay = date([year, month, daysInMonth]);
            var lastMonth = date(firstDay).subtract(1, 'month').month();
            var lastYear = date(firstDay).subtract(1, 'month').year();
            var daysInLastMonth = date([lastYear, lastMonth, 1]).daysInMonth();
            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = date([lastYear, lastMonth, startDay, 12, minute, second]);

            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = curDate.clone().add(1, 'day')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
                curDate.hour(12);

                if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
                    calendar[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
                    calendar[row][col] = this.maxDate.clone();
                }

            }

            //make the calendar object available to hoverDate/clickDate
            if (side == 'left') {
                this.leftCalendar.calendar = calendar;
            } else {
                this.rightCalendar.calendar = calendar;
            }

            //
            // Display the calendar
            //

            var minDate = side == 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th></th>';

            if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.linkedCalendars || side == 'left')) {
                html += '<th role="button" tabindex="0" aria-label="Previous month" class="prev available"><span></span></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = escapeHtml(this.locale.monthNames[calendar[1][1].month()]) + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                var currentMonth = calendar[1][1].month();
                var currentYear = calendar[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (this.maxYear);
                var minYear = (minDate && minDate.year()) || (this.minYear);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;

                var monthHtml = '<select aria-label="Month" class="monthselect">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || !minDate || m >= minDate.month()) && (!inMaxYear || !maxDate || m <= maxDate.month())) {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + escapeHtml(this.locale.monthNames[m]) + "</option>";
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + escapeHtml(this.locale.monthNames[m]) + "</option>";
                    }
                }
                monthHtml += "</select>";

                var yearHtml = '<select aria-label="Year" class="yearselect">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';

                dateHtml = monthHtml + yearHtml;
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if ((!maxDate || maxDate.isAfter(calendar.lastDay, 'month')) && (!this.linkedCalendars || side == 'right' || this.singleDatePicker || this.singleCalendar)) {
                html += '<th role="button" tabindex="0" aria-label="Next month" class="next available"><span></span></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th class="week">' + escapeHtml(this.locale.weekLabel) + '</th>';

            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += '<th>' + escapeHtml(dayOfWeek) + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            //adjust maxDate to reflect the maxSpan setting in order to
            //grey out end dates beyond the maxSpan
            if (this.endDate == null && this.maxSpan) {
                var maxLimit = this.startDate.clone().add(this.maxSpan).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            const earliestEnd = this.minSpan && this.startDate.clone().add(this.minSpan);
            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';
                else if (this.showISOWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].isoWeek() + '</td>';

                for (var col = 0; col < 7; col++) {

                    var classes = [];

                    //highlight today's date
                    if (calendar[row][col].isSame(new Date(), "day"))
                        classes.push('today');

                    //highlight weekends
                    if (calendar[row][col].isoWeekday() > 5)
                        classes.push('weekend');

                    //grey out the dates in other months displayed at beginning and end of this calendar
                    if (calendar[row][col].month() != calendar[1][1].month())
                        classes.push('off', 'ends');

                    //don't allow selection of dates before the minimum date
                    if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of dates after the maximum date
                    if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
                        classes.push('off', 'disabled');

                    if (earliestEnd) {
                        const day = calendar[row][col];
                        const choosingStart = this.endDate || day.isBefore(this.startDate, 'day');
                        const tooLate = choosingStart && this.maxDate && day.clone().add(this.minSpan).isAfter(this.maxDate, 'day');
                        if (tooLate || (!choosingStart && day.isBefore(earliestEnd, 'day')))
                            classes.push('off', 'disabled');
                    }

                    //don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendar[row][col]))
                        classes.push('off', 'disabled');

                    //highlight the currently selected start date
                    if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD'))
                        classes.push('active', 'start-date');

                    //highlight the currently selected end date
                    if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD'))
                        classes.push('active', 'end-date');

                    //highlight dates in-between the selected dates
                    if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate)
                        classes.push('in-range');

                    //apply custom classes for this date
                    var isCustom = this.isCustomDate(calendar[row][col]);
                    if (isCustom !== false) {
                        if (typeof isCustom === 'string')
                            classes.push(isCustom);
                        else
                            Array.prototype.push.apply(classes, isCustom);
                    }

                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] == 'disabled')
                            disabled = true;
                    }
                    if (!disabled)
                        cname += 'available';

                    const isoDate = calendar[row][col].format('YYYY-MM-DD');
                    html += '<td role="button" tabindex="-1" data-date="' + isoDate + '" aria-label="' + isoDate +
                        '" aria-disabled="' + disabled + '" class="' + escapeHtml(cname.trim()) + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            const table = this.container.find('.drp-calendar.' + side + ' .calendar-table').html(html)[0];
            if (table) {
                const tabStop = table.querySelector('td.available.active:not(.ends)') || table.querySelector('td.available:not(.ends)');
                if (tabStop) tabStop.tabIndex = 0;
            }

        },

        renderTimePicker: function(side) {

            // Don't bother updating the time picker if it's currently disabled
            // because an end date hasn't been clicked yet
            if (side == 'right' && !this.endDate) return;

            var html, selected, minDate, maxDate = this.maxDate;

            if (side === 'right' && this.maxSpan && (!this.maxDate || this.startDate.clone().add(this.maxSpan).isBefore(this.maxDate)))
                maxDate = this.startDate.clone().add(this.maxSpan);

            if (side == 'left') {
                selected = this.startDate.clone();
                minDate = this.minDate;
            } else if (side == 'right') {
                selected = this.endDate.clone();
                minDate = this.minSpan ? this.startDate.clone().add(this.minSpan) : this.startDate;

                if (selected.isBefore(this.startDate))
                    selected = this.startDate.clone();

                if (maxDate && selected.isAfter(maxDate))
                    selected = maxDate.clone();

            }

            //
            // hours
            //

            html = '<select aria-label="Hour" class="hourselect">';

            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;

            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour)
                    i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);

                var time = selected.clone().hour(i_in_24);
                var disabled = false;
                if (minDate && time.clone().endOf('hour').isBefore(minDate))
                    disabled = true;
                if (maxDate && time.clone().startOf('hour').isAfter(maxDate))
                    disabled = true;

                if (i_in_24 == selected.hour() && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }

            html += '</select> ';

            //
            // minutes
            //

            html += ': <select aria-label="Minute" class="minuteselect">';

            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().minute(i);

                var disabled = false;
                if (minDate && time.clone().endOf('minute').isBefore(minDate))
                    disabled = true;
                if (maxDate && time.clone().startOf('minute').isAfter(maxDate))
                    disabled = true;

                if (selected.minute() == i && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }

            html += '</select> ';

            //
            // seconds
            //

            if (this.timePickerSeconds) {
                html += ': <select aria-label="Second" class="secondselect">';

                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.clone().second(i);

                    var disabled = false;
                    if (minDate && time.isBefore(minDate))
                        disabled = true;
                    if (maxDate && time.isAfter(maxDate))
                        disabled = true;

                    if (selected.second() == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }

                html += '</select> ';
            }

            //
            // AM/PM
            //

            if (!this.timePicker24Hour) {
                html += '<select aria-label="AM/PM" class="ampmselect">';

                var am_html = '';
                var pm_html = '';

                if (minDate && selected.clone().hour(11).endOf("hour").isBefore(minDate))
                    am_html = ' disabled="disabled" class="disabled"';

                if (maxDate && selected.clone().hour(12).minute(0).second(0).isAfter(maxDate))
                    pm_html = ' disabled="disabled" class="disabled"';

                if (selected.hour() >= 12) {
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }

                html += '</select>';
            }

            this.container.find('.drp-calendar.' + side + ' .calendar-time').html(html);

        },

        updateFormInputs: function() {

            if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
                this.container.find('button.applyBtn').prop('disabled', false);
            } else {
                this.container.find('button.applyBtn').prop('disabled', true);
            }

        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop,
                drops = this.drops;

            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl[0].scrollTop,
                    left: this.parentEl.offset().left - this.parentEl[0].scrollLeft
                };
                parentRightEdge = this.parentEl[0].clientWidth + parentOffset.left;
            }

            switch (drops) {
            case 'auto':
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
                const trigger = this.element[0].getBoundingClientRect();
                if (trigger.bottom + this.container.outerHeight() > window.innerHeight &&
                    trigger.top > window.innerHeight - trigger.bottom) {
                    containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
                    drops = 'up';
                }
                break;
            case 'up':
                containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
                break;
            default:
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
                break;
            }

            // Force the container to it's actual width
            this.container.css({
              left: 0,
              right: 'auto'
            });
            var containerWidth = this.container.outerWidth();

            this.container.toggleClass('drop-up', drops == 'up');

            if (this.opens == 'left') {
                var containerRight = parentRightEdge - this.element.offset().left - this.element.outerWidth();
                if (containerWidth + containerRight > $(window).width()) {
                    this.container.css({
                        top: containerTop,
                        right: 'auto',
                        left: 9
                    });
                } else {
                    this.container.css({
                        top: containerTop,
                        right: containerRight,
                        left: 'auto'
                    });
                }
            } else if (this.opens == 'center') {
                var containerLeft = this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                                        - containerWidth / 2;
                if (containerLeft < 0) {
                    this.container.css({
                        top: containerTop,
                        right: 'auto',
                        left: 9
                    });
                } else if (containerLeft + containerWidth > $(window).width()) {
                    this.container.css({
                        top: containerTop,
                        left: 'auto',
                        right: 0
                    });
                } else {
                    this.container.css({
                        top: containerTop,
                        left: containerLeft,
                        right: 'auto'
                    });
                }
            } else {
                var containerLeft = this.element.offset().left - parentOffset.left;
                if (containerLeft + containerWidth > $(window).width()) {
                    this.container.css({
                        top: containerTop,
                        left: 'auto',
                        right: 0
                    });
                } else {
                    this.container.css({
                        top: containerTop,
                        left: containerLeft,
                        right: 'auto'
                    });
                }
            }
        },

        emit: function(name) {
            const type = name + '.daterangepicker';
            const element = this.element[0];
            const event = element.ownerDocument.createEvent('CustomEvent');
            event.initCustomEvent(type, true, false, this);
            element.dispatchEvent(event);
            if (jquery) this.element.trigger(type, this);
        },

        show: function(e) {
            if (this.isShowing) return;

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = this.outsideClick.bind(this);

            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown' + this.eventNamespace, this._outsideClickProxy)
              // also support mobile devices
              .on('touchend' + this.eventNamespace, this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click' + this.eventNamespace, '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin' + this.eventNamespace, this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            $(window).on('resize' + this.eventNamespace, this.move.bind(this));
            // Scroll events from nested panels don't bubble. Capture them while open.
            window.addEventListener('scroll', this._onScroll, true);

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.oldChosenLabel = this.chosenLabel;

            this.updateView();
            this.container.show();
            this.move();
            this.isShowing = true;
            this.emit('show');
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
                this.callback(this.startDate.clone(), this.endDate.clone(), this.chosenLabel);

            //if picker is attached to a text input, update it
            this.updateElement();

            this.unbindGlobalEvents();
            this.container.hide();
            this.isShowing = false;
            this.emit('hide');
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
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-table').length
                ) return;
            this.hide();
            this.emit('outsideClick');
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.emit('showCalendar');
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.emit('hideCalendar');
        },

        clickRange: function(e) {
            var label = e.target.getAttribute('data-range-key');
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.container.find('.ranges li').removeClass('active');
                $(e.target).addClass('active');
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0].clone();
                this.endDate = dates[1].clone();

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                if (!this.applyOnRangeClick) {
                    this.showCalendars();
                    this.updateView();
                    return;
                }
                if (!this.alwaysShowCalendars)
                    this.hideCalendars();
                this.clickApply();
            }
        },

        clickPrev: function(e) {
            var cal = $(e.target).parents('.drp-calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
                if (this.linkedCalendars)
                    this.rightCalendar.month.subtract(1, 'month');
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function(e) {
            var cal = $(e.target).parents('.drp-calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars)
                    this.leftCalendar.month.add(1, 'month');
            }
            this.updateCalendars();
        },

        hoverDate: function(e) {

            //ignore dates that can't be selected
            if (!$(e.target).hasClass('available')) return;

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.drp-calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            //highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;
            if (!this.endDate) {
                this.container.find('.drp-calendar tbody td').each(function(index, el) {

                    //skip week numbers, only look at dates
                    if ($(el).hasClass('week')) return;

                    var title = $(el).attr('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = $(el).parents('.drp-calendar');
                    var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

                    if ((dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
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
            var cal = $(e.target).parents('.drp-calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            const choosingStart = this.endDate !== null || date.isBefore(this.startDate, 'day');
            if (this.timePicker) date = this.withSelectedTime(date, choosingStart ? 'left' : 'right');
            if (choosingStart) {
                this.endDate = null;
                this.setStartDate(date);
                this.emit('selectStart');
            }
            if (!choosingStart || this.singleDatePicker) {
                this.setEndDate(this.singleDatePicker ? this.startDate : date);
                this.emit('selectEnd');
                if (this.autoApply) {
                    this.calculateChosenLabel();
                    this.clickApply();
                }
            }

            this.updateView();

            //This is to cancel the blur event handler if the mouse was in one of the inputs
            e.stopPropagation();

        },

        calculateChosenLabel: function () {
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
              if (this.timePicker) {
                    var format = this.timePickerSeconds ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD HH:mm";
                    //ignore times when comparing dates if time picker seconds is not enabled
                    if (this.startDate.format(format) == this.ranges[range][0].format(format) && this.endDate.format(format) == this.ranges[range][1].format(format)) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li').eq(i).addClass('active').attr('data-range-key');
                        break;
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li').eq(i).addClass('active').attr('data-range-key');
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenLabel = this.container.find('.ranges li').last().addClass('active').attr('data-range-key');
                } else {
                    this.chosenLabel = null;
                }
                this.showCalendars();
            }
        },

        clickApply: function(e) {
            this.hide();
            this.emit('apply');
        },

        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.chosenLabel = this.oldChosenLabel;
            this.hide();
            this.emit('cancel');
        },

        monthOrYearChanged: function(e) {
            var isLeft = $(e.target).closest('.drp-calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.drp-calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
            this.updateCalendars();
        },

        timeChanged: function(e) {
            if ($(e.target).closest('.drp-calendar').hasClass('left')) {
                this.setStartDate(this.withSelectedTime(this.startDate, 'left'));
            } else if (this.endDate) {
                this.setEndDate(this.withSelectedTime(this.endDate, 'right'));
            }
            this.updateView();
        },

        elementChanged: function() {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.locale.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = date(dateString[0], this.locale.format);
                end = date(dateString[1], this.locale.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = date(this.element.val(), this.locale.format);
                end = start;
            }

            if (!start.isValid() || !end.isValid()) return;

            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();
        },

        calendarKeydown: function(e) {
            const target = e.target;
            if (e.key === 'Escape') {
                e.preventDefault();
                this.element[0].focus();
                this.clickCancel();
                return;
            }
            if ((e.key === 'Enter' || e.key === ' ') && $(target).is('[role=button]')) {
                e.preventDefault();
                if ($(target).is('td.available')) {
                    const calendar = $(target).closest('.drp-calendar')[0];
                    this.clickDate(e);
                    if (this.isShowing) calendar.querySelector('[data-date="' + target.dataset.date + '"]')?.focus();
                } else if (!$(target).is('td')) {
                    const parent = $(target).closest('.drp-calendar')[0];
                    target.click();
                    if (parent) parent.querySelector('td[tabindex="0"]')?.focus();
                }
                return;
            }
            const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
            if (!step || !$(target).is('td[data-date]')) return;
            e.preventDefault();
            const delta = this.locale.direction === 'rtl' && Math.abs(step) === 1 ? -step : step;
            const next = date(target.dataset.date, 'YYYY-MM-DD').add(delta, 'day');
            if ((this.minDate && next.isBefore(this.minDate, 'day')) ||
                (this.maxDate && next.isAfter(this.maxDate, 'day'))) return;

            const panel = $(target).closest('.drp-calendar')[0];
            const left = panel.classList.contains('left');
            const calendar = left ? this.leftCalendar : this.rightCalendar;
            if (!calendar.month.isSame(next, 'month')) {
                calendar.month = next.clone().date(2);
                if (this.linkedCalendars) {
                    const other = left ? this.rightCalendar : this.leftCalendar;
                    other.month = calendar.month.clone().add(left ? 1 : -1, 'month');
                }
                this.updateCalendars();
            }
            const nextCell = panel.querySelector('[data-date="' + next.format('YYYY-MM-DD') + '"]');
            if (nextCell) {
                panel.querySelector('td[tabindex="0"]')?.setAttribute('tabindex', '-1');
                nextCell.tabIndex = 0;
                nextCell.focus();
            }
        },

        keydown: function(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.show();
                const focusTarget = this.container.hasClass('show-calendar')
                    ? this.container.find('.left td[tabindex="0"]')[0] : this.container.find('.ranges li')[0];
                focusTarget?.focus();
                return;
            }
            //hide on tab or enter
            if (e.key === 'Tab' || e.key === 'Enter' || e.keyCode === 9 || e.keyCode === 13) {
                this.hide();
            }

            //hide on esc and prevent propagation
            if (e.key === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },

        updateElement: function() {
            if (this.element.is('input') && this.autoUpdateInput) {
                var newValue = this.startDate.format(this.locale.format);
                if (!this.singleDatePicker) {
                    newValue += this.locale.separator + this.endDate.format(this.locale.format);
                }
                if (newValue !== this.element.val()) {
                    this.element.val(newValue);
                    const input = this.element[0];
                    const event = input.ownerDocument.createEvent('Event');
                    event.initEvent('change', true, false);
                    input.dispatchEvent(event);
                }
            }
        },

        unbindGlobalEvents: function() {
            $(document).off(this.eventNamespace);
            $(window).off(this.eventNamespace);
            window.removeEventListener('scroll', this._onScroll, true);
            if (this._scrollFrame !== null) {
                window.cancelAnimationFrame(this._scrollFrame);
                this._scrollFrame = null;
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off(this.eventNamespace);
            this.unbindGlobalEvents();
            if (instances.get(this.element[0]) === this) {
                instances.delete(this.element[0]);
                if (jquery) this.element.removeData('daterangepicker');
            }
            this.isShowing = false;
        }

    };

    DateRangePicker.getInstance = element => instances.get(element);
    DateRangePicker.installJQuery = (adapter, legacyDate = date) => createPicker(adapter, legacyDate);

    if (jquery) {
        jquery.fn.daterangepicker = function(options, callback) {
            const settings = jquery.extend(true, {}, jquery.fn.daterangepicker.defaultOptions, options);
            return this.each(function() { new DateRangePicker(this, settings, callback); });
        };
    }

    return DateRangePicker;

}


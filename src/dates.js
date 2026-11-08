// Keep Day.js immutable internally. Picker dates have Moment's mutable setters
// because existing callbacks and the calendar navigation rely on chaining them.
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import arraySupport from 'dayjs/plugin/arraySupport';
import objectSupport from 'dayjs/plugin/objectSupport';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

for (const plugin of [utc, timezone, arraySupport, customParseFormat, localizedFormat,
    localeData, isoWeek, weekOfYear, weekYear, quarterOfYear, objectSupport, advancedFormat]) {
    dayjs.extend(plugin);
}

function unwrap(value) {
    return value && typeof value.toDate === 'function' ? value.toDate() : value;
}

class PickerDate {
    constructor(value) {
        this.value = value;
    }

    clone() {
        return new PickerDate(this.value.clone());
    }
}

for (const name of ['format', 'toDate', 'toISOString', 'toJSON', 'toString', 'unix',
    'valueOf', 'daysInMonth', 'isValid', 'localeData', 'get']) {
    PickerDate.prototype[name] = function (...args) {
        return this.value[name](...args);
    };
}

for (const name of ['diff', 'isBefore', 'isSame', 'isAfter']) {
    PickerDate.prototype[name] = function (other, ...args) {
        return this.value[name](unwrap(other), ...args);
    };
}

for (const name of ['startOf', 'endOf', 'add', 'subtract', 'set']) {
    PickerDate.prototype[name] = function (...args) {
        this.value = this.value[name](...args);
        return this;
    };
}

for (const unit of ['millisecond', 'second', 'minute', 'hour', 'date', 'day',
    'week', 'isoWeek', 'isoWeekday', 'month', 'quarter', 'year']) {
    PickerDate.prototype[unit] = function (value) {
        if (value === undefined) return this.value[unit]();
        this.value = this.value[unit](value);
        return this;
    };
    PickerDate.prototype[unit + 's'] = PickerDate.prototype[unit];
}

export function date(value, format) {
    let parsed = dayjs(unwrap(value), format, Boolean(format));
    if (format && !parsed.isValid() && typeof value === 'string') {
        // Accept unpadded numeric fields while still rejecting calendar overflow.
        const flexible = format.replace(/\[[^\]]*\]|MMMM|MMM|MM|DD|HH|hh|mm|ss/g,
            token => token.length === 2 ? token[0] : token);
        const candidate = dayjs(value.trim(), flexible);
        const normalize = text => text.trim().replace(/\b0+(?=\d)/g, '').toLowerCase();
        if (candidate.isValid() && normalize(candidate.format(format)) === normalize(value)) parsed = candidate;
    }
    return new PickerDate(parsed);
}
date.localeData = dayjs.localeData;
date.weekdaysMin = dayjs.weekdaysMin;
date.monthsShort = dayjs.monthsShort;


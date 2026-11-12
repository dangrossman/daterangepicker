const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const script = fs.readFileSync(require.resolve('../daterangepicker.js'), 'utf8');

function page(t, legacy = false, html = '<input id="range"><button id="other"></button>') {
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    t.after(() => dom.window.close());
    const w = dom.window;
    if (legacy) {
        w.eval(fs.readFileSync(require.resolve('jquery'), 'utf8'));
        w.eval(fs.readFileSync(require.resolve('moment'), 'utf8'));
    }
    w.eval(script);
    return w;
}

const february = { startDate: '02/14/2024', endDate: '02/16/2024' };
const cell = (p, day, side = 'left') => [...p.container[0].querySelectorAll('.' + side + ' td.available:not(.off)')].find(td => td.textContent === String(day));

test('open pickers track page and ancestor scrolling only for their own lifetime', t => {
    const w = page(t, false, '<div id="panel"><input></div><div id="other"></div>');
    const frames = new Map();
    let id = 0;
    w.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
    w.cancelAnimationFrame = handle => frames.delete(handle);
    function flush() {
        for (const [handle, callback] of frames) {
            frames.delete(handle);
            callback();
        }
    }
    const p = new w.DateRangePicker('input', february);
    const scroll = element => element.dispatchEvent(new w.Event('scroll', { bubbles: false }));
    p.show();
    let moves = 0;
    p.move = () => moves++;
    scroll(w.document.querySelector('#other'));
    assert.equal(frames.size, 0);
    scroll(w.document.querySelector('#panel'));
    assert.equal(frames.size, 1);
    scroll(w.document);
    assert.equal(frames.size, 1);
    flush();
    assert.equal(moves, 1);
    scroll(w);
    assert.equal(frames.size, 1);
    p.hide();
    scroll(w);
    assert.equal(frames.size, 0);
    p.show();
    scroll(w.document);
    assert.equal(frames.size, 1);
    p.remove();
    scroll(w.document.querySelector('#panel'));
    assert.equal(frames.size, 0);
});

for (const legacy of [false, true]) {
    const mode = legacy ? 'jQuery and Moment' : 'standalone';
    test(mode + ' selects a leap-day range, fires events and restores on cancel', t => {
        const w = page(t, legacy);
        const input = w.document.querySelector('input');
        let calls = 0;
        const changed = (start, end) => {
            assert.equal(start.format('YYYY-MM-DD'), '2024-02-27');
            assert.equal(end.format('YYYY-MM-DD'), '2024-02-29');
            start.add(1, 'year');
            calls++;
        };
        const picker = legacy
            ? w.jQuery(input).daterangepicker(february, changed).data('daterangepicker')
            : new w.DateRangePicker(input, february, changed);
        assert.equal(w.daterangepicker.getInstance(input), picker);
        let native = 0, bridged = 0;
        input.addEventListener('apply.daterangepicker', e => { assert.equal(e.detail, picker); native++; });
        if (legacy) w.jQuery(input).on('apply.daterangepicker', (_, p) => { assert.equal(p, picker); bridged++; });
        input.click();
        assert.equal(picker.container.find('td[data-title]').length, 84);
        cell(picker, 27).dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
        assert.equal(picker.endDate, null);
        cell(picker, 29).dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
        picker.container.find('.applyBtn')[0].click();
        assert.equal(input.value, '02/27/2024 - 02/29/2024');
        assert.deepEqual([calls, native, bridged], [1, 1, Number(legacy)]);
        input.click();
        cell(picker, 2).dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
        picker.container.find('.cancelBtn')[0].click();
        assert.equal(input.value, '02/27/2024 - 02/29/2024');
        assert.equal(picker.isShowing, false);
    });

    test(mode + ' preserves data, application subscriptions and other open instances on teardown', t => {
        const w = page(t, legacy);
        const element = w.document.querySelector('input');
        if (legacy) w.jQuery(element).data('keep', 42);
        const p = new w.DateRangePicker(element, february);
        const other = new w.DateRangePicker('#other', february);
        other.show();
        p.show();
        p.remove();
        w.document.body.dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
        assert.equal(other.isShowing, false);
        assert.equal(w.DateRangePicker.getInstance(element), undefined);
        assert.equal(w.document.querySelectorAll('.daterangepicker').length, 1);
        if (legacy) assert.equal(w.jQuery(element).data('keep'), 42);
    });
}

test('preset constraints, labels, updates and AM/PM selection', t => {
    const w = page(t);
    const p = new w.DateRangePicker('#range', {
        timePicker: true, applyOnRangeClick: false, locale: { format: 'YYYY-MM-DD HH:mm' },
        maxDate: '2024-05-05 14:00', maxSpan: { days: 2 },
        startDate: '2024-05-01 08:00', endDate: '2024-05-01 09:00',
        ranges: { 'Evening &amp; night': ['2024-05-02 15:00', '2024-05-02 19:00'] }
    });
    p.show();
    p.container.find('.ranges li')[0].click();
    assert.equal(p.chosenLabel, 'Evening & night');
    assert.equal(p.container.find('.right .ampmselect').val(), 'PM');
    assert.equal(p.container.find('.right .hourselect').val(), '7');
    assert.equal(p.isShowing, true);
    const label = '<img src=x> "';
    p.setRanges({ [label]: ['2024-05-01 12:00', '2024-05-10 12:00'] });
    assert.equal(p.container.find('.ranges img').length, 0);
    assert.equal(p.container.find('.ranges li')[0].dataset.rangeKey, label);
    assert.equal(p.ranges[label][1].format('DD HH:mm'), '03 12:00');
});

test('invalid typed input and invalid setters leave usable dates', t => {
    const w = page(t, false, '<input id="range" value="bad - input" data-show-dropdowns="true">');
    const p = new w.DateRangePicker('#range');
    const before = p.startDate.valueOf();
    p.setStartDate('02/31/2024');
    assert.equal(p.startDate.valueOf(), before);
    p.show();
    assert.equal(p.showDropdowns, true);
    assert.equal(p.container.find('td[data-title]').length, 84);
    assert.doesNotMatch(p.container.text(), /NaN|Invalid Date/);
});

test('compact range navigation respects max month and selectable boundary years', t => {
    const w = page(t);
    const p = new w.DateRangePicker('#range', {
        ...february, maxDate: new w.Date(2024, 2, 31, 23), minYear: 2024, maxYear: 2024,
        singleCalendar: true, showDropdowns: true, autoApply: true
    });
    p.show();
    assert.equal(p.container.find('.right')[0].style.display, 'none');
    assert.equal(p.container.find('.left .monthselect option:not(:disabled)').length, 3);
    cell(p, 28).dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
    p.container.find('.left .next')[0].click();
    assert.equal(p.container.find('.left .next').length, 0);
    cell(p, 2).dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
    assert.equal(w.document.querySelector('input').value, '02/28/2024 - 03/02/2024');
    assert.equal(p.isShowing, false);
});

test('module imports work without a DOM', async () => {
    assert.equal(typeof require('daterangepicker'), 'function');
    const esm = await import('daterangepicker');
    assert.equal(esm.default, esm.DateRangePicker);
    assert.equal(typeof esm.default, 'function');
});

test('minimum span and maximum date apply to keyboard selection, setters and presets', t => {
    const w = page(t);
    const p = new w.DateRangePicker('#range', {
        ...february, minSpan: { days: 3 }, maxDate: '02/29/2024', ranges: { Short: ['02/14/2024', '02/15/2024'] }
    });
    assert.equal(p.endDate.date(), 17);
    assert.equal(p.ranges.Short[1].date(), 17);
    p.show();
    const key = (el, key) => el.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    key(p.element[0], 'ArrowDown');
    key(cell(p, 22), 'Enter');
    assert.equal(p.endDate, null);
    assert.equal(cell(p, 24), undefined);
    key(p.container.find('[data-date="2024-02-24"]')[0], 'ArrowRight');
    assert.equal(w.document.activeElement.dataset.date, '2024-02-25');
    key(w.document.activeElement, 'Enter');
    assert.equal(p.endDate.date(), 25);
    key(w.document.activeElement, 'Escape');
    assert.equal(p.startDate.date(), 14);
    p.setStartDate('02/29/2024');
    assert.equal(p.startDate.date(), 26);
    assert.equal(p.endDate.date(), 29);
});

test('locale, week numbers, custom dates, single date and empty inputs', t => {
    const w = page(t);
    const p = new w.DateRangePicker('#range', {
        singleDatePicker: true, autoUpdateInput: false, startDate: '31.12.2020',
        locale: { direction: 'rtl', firstDay: 1, format: 'DD.MM.YYYY', daysOfWeek: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] },
        showISOWeekNumbers: true, isCustomDate: day => day.date() === 25 ? ['holiday', 'closed'] : false,
        isInvalidDate: day => day.day() === 0
    });
    p.show();
    assert.equal(p.container.find('.left .week').length, 7);
    assert.equal(p.container.find('.left thead tr:last-child th').eq(1).text(), 'Mo');
    assert.equal(p.container.find('.left .holiday.closed').text(), '25');
    assert.equal(p.container.find('.left td[data-date="2020-12-27"]').hasClass('disabled'), true);
    assert.equal(p.startDate.isoWeek(), 53);
    assert.equal(p.startDate.clone().add(1, 'day').isoWeek(), 53);
    assert.equal(p.element.val(), '');
    assert.equal(p.container.hasClass('rtl'), true);
});

test('calendar increments preserve local days through DST and month-end arithmetic', t => {
    const w = page(t);
    const p = new w.DateRangePicker('#range', { startDate: '03/01/2024', endDate: '03/31/2024' });
    p.show();
    const days = p.leftCalendar.calendar.flat();
    for (let i = 1; i < days.length; i++) {
        assert.equal(days[i].format('YYYY-MM-DD'), days[i-1].clone().add(1, 'day').format('YYYY-MM-DD'));
        assert.equal(days[i].hour(), 0);
    }
    assert.equal(p.endDate.clone().subtract(1, 'month').format('YYYY-MM-DD'), '2024-02-29');
});

test('jQuery alone uses the standalone dates and honors plugin defaults', t => {
    const w = page(t);
    w.eval(fs.readFileSync(require.resolve('jquery'), 'utf8'));
    w.DateRangePicker.installJQuery(w.jQuery);
    const $input = w.jQuery('input');
    w.jQuery.fn.daterangepicker.defaultOptions = { locale: { format: 'YYYY-MM-DD', separator: ' / ' } };
    assert.equal($input.daterangepicker({ startDate: '2024-01-02', endDate: '2024-01-05' }), $input);
    assert.equal($input.val(), '2024-01-02 / 2024-01-05');
    const picker = $input.data('daterangepicker');
    assert.equal(picker.endDate.diff(picker.startDate, 'days'), 3);
    let applies = 0;
    $input.on('apply.daterangepicker', () => applies++);
    $input.daterangepicker();
    $input.data('daterangepicker').show();
    $input.data('daterangepicker').container.find('.applyBtn')[0].click();
    assert.equal(applies, 1);
});

test('AMD loads without peers and discovers configured legacy modules', t => {
    for (const legacy of [false, true]) {
        const w = page(t, legacy);
        let Picker;
        w.requirejs = { specified: () => legacy, s: { contexts: { _: { config: { paths: {} } } } } };
        w.define = (names, factory) => {
            assert.deepEqual(Array.from(names), legacy ? ['jquery', 'moment'] : []);
            Picker = factory(...Array.from(names, name => name === 'jquery' ? w.jQuery : w.moment));
        };
        w.define.amd = {};
        w.eval(script);
        const p = new Picker('input', february);
        p.show();
        assert.equal(p.container.find('td[data-date]').length, 84);
        if (legacy) assert.equal(w.moment.isMoment(p.startDate), true);
    }
});


test('a disabled input rejects dates from an already-open picker', t => {
    const w = page(t);
    const input = w.document.querySelector('input');
    let changes = 0;
    const p = new w.DateRangePicker(input, { ...february, singleDatePicker: true, autoApply: true }, () => changes++);
    input.click();

    input.disabled = true;
    const select = day => cell(p, day).dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true }));
    select(20);
    assert.equal(input.value, '02/14/2024');
    assert.equal(p.startDate.format('YYYY-MM-DD'), '2024-02-14');
    assert.equal(changes, 0);

    input.disabled = false;
    select(20);
    assert.equal(input.value, '02/20/2024');
    assert.equal(changes, 1);
});

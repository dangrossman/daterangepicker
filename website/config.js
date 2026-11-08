/* The generated example and the live preview share the same options. */
(() => {
    const settings = document.querySelector('#settings');
    const fields = settings.elements;
    const preview = document.querySelector('#date-range');
    const generated = document.querySelector('#generated');
    const formStatus = document.querySelector('#form-status');
    const copy = document.querySelector('#copy-code');
    const copyStatus = document.querySelector('#copy-status');
    let picker;

    // This self-contained function is included in snippets that use presets.
    function commonPresets() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();
        const offset = days => new Date(year, month, day + days);
        return {
            'Today': [offset(0), offset(0)],
            'Yesterday': [offset(-1), offset(-1)],
            'Last 7 Days': [offset(-6), offset(0)],
            'Last 30 Days': [offset(-29), offset(0)],
            'This Month': [new Date(year, month, 1), new Date(year, month + 1, 0)],
            'Last Month': [new Date(year, month - 1, 1), new Date(year, month, 0)]
        };
    }

    function updateAvailability() {
        const singleDate = fields.mode.value === 'singleDatePicker';
        fields.endDate.disabled = singleDate;
        fields.minSpan.disabled = singleDate;
        fields.maxSpan.disabled = singleDate;
        fields.linkedCalendars.disabled = fields.mode.value !== 'range';
        fields.autoApply.disabled = fields.timePicker.checked;
        fields.applyOnRangeClick.disabled = !fields.ranges.checked || (fields.autoApply.checked && !fields.timePicker.checked);
        fields.alwaysShowCalendars.disabled = !fields.ranges.checked;
        fields.showCustomRangeLabel.disabled = !fields.ranges.checked;
        for (const name of ['timePicker24Hour', 'timePickerSeconds', 'timePickerIncrement'])
            fields[name].disabled = !fields.timePicker.checked;
        for (const name of ['minYear', 'maxYear']) fields[name].disabled = !fields.showDropdowns.checked;
    }

    function checkOrder(first, last, message) {
        const start = fields[first], end = fields[last];
        if (start.disabled || end.disabled || !start.value || !end.value) return;
        if (start.valueAsNumber > end.valueAsNumber) throw new Error(message);
    }

    function readOptions() {
        const invalid = Array.from(fields).find(field => field.willValidate && !field.validity.valid);
        if (invalid) throw new Error(invalid.labels[0].textContent.trim() + ' — ' + invalid.validationMessage);
        checkOrder('minDate', 'maxDate', 'Choose a latest date on or after the earliest date.');
        checkOrder('startDate', 'endDate', 'Choose an end date on or after the start date.');
        checkOrder('minSpan', 'maxSpan', 'The maximum span must be at least the minimum span.');
        checkOrder('minYear', 'maxYear', 'Choose a last dropdown year on or after the first year.');
        try {
            document.querySelector(fields.parentEl.value);
        } catch {
            throw new Error('Enter a valid CSS selector for the parent element.');
        }

        const options = {};
        if (fields.mode.value !== 'range') options[fields.mode.value] = true;
        if (fields.weeks.value) options[fields.weeks.value] = true;
        for (const name of ['startDate', 'endDate', 'minDate', 'maxDate']) {
            if (!fields[name].disabled && fields[name].value) {
                const [year, month, day] = fields[name].value.split('-').map(Number);
                options[name] = [year, month - 1, day];
            }
        }
        for (const name of ['minSpan','maxSpan']) {
            if (!fields[name].disabled && fields[name].value) options[name] = { days: fields[name].valueAsNumber };
        }
        for (const input of settings.querySelectorAll('input[type="checkbox"]:not(:disabled)')) {
            if (input.name !== 'ranges' && input.checked !== input.defaultChecked) options[input.name] = input.checked;
        }
        for (const name of ['minYear','maxYear','timePickerIncrement']) {
            const input = fields[name];
            if (!input.disabled && input.value && input.value !== input.defaultValue)
                options[name] = input.valueAsNumber;
        }
        if (fields.ranges.checked) options.ranges = commonPresets();
        if (fields.opens.value !== 'right') options.opens = fields.opens.value;
        if (fields.drops.value !== 'down') options.drops = fields.drops.value;
        for (const name of ['parentEl','buttonClasses','applyButtonClasses','cancelButtonClasses']) {
            if (fields[name].value !== fields[name].defaultValue) options[name] = fields[name].value;
        }
        const locale = {};
        for (const name of ['format','separator','applyLabel','cancelLabel','customRangeLabel','weekLabel']) {
            const value = fields[name].value;
            if (value === fields[name].defaultValue) continue;
            // Apply and Cancel labels accept HTML. Treat the form fields as plain text.
            locale[name] = name === 'applyLabel' || name === 'cancelLabel'
                ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : value;
        }
        if (fields.direction.value !== 'ltr') locale.direction = fields.direction.value;
        if (fields.firstDay.value !== '0') locale.firstDay = Number(fields.firstDay.value);
        for (const [name, count] of [['daysOfWeek', 7], ['monthNames', 12]]) {
            if (fields[name].value === fields[name].defaultValue) continue;
            const labels = fields[name].value.split(',').map(label => label.trim());
            if (labels.length !== count || labels.includes(''))
                throw new Error('Enter ' + count + ' comma-separated ' + (name === 'daysOfWeek' ? 'weekday' : 'month') + ' labels.');
            locale[name] = labels;
        }
        if (Object.keys(locale).length) options.locale = locale;
        return options;
    }

    function snippet(options) {
        const entries = Object.entries(options).map(([key, value]) => {
            const expression = key === 'ranges' ? 'commonPresets()' : JSON.stringify(value, null, 2);
            return '  ' + key + ': ' + expression.replace(/\n/g, '\n  ');
        });
        const argument = entries.length ? ', {\n' + entries.join(',\n') + '\n}' : '';
        const helpers = options.ranges ? commonPresets.toString().replace(/^ {4}/gm, '') + '\n\n' : '';
        return helpers + "const picker = new DateRangePicker('#date-range'" + argument + ');';
    }

    function refresh() {
        updateAvailability();
        copyStatus.textContent = '';
        try {
            const options = readOptions();
            const code = snippet(options);
            if (generated.textContent !== code || copy.disabled) {
                if (picker) picker.remove();
                preview.value = '';
                picker = new DateRangePicker(preview, options);
                generated.textContent = code;
            }
            formStatus.textContent = '';
            copy.disabled = false;
        } catch (error) {
            formStatus.textContent = error.message;
            copy.disabled = true;
        }
    }

    settings.addEventListener('submit', event => event.preventDefault());
    settings.addEventListener('input', refresh);
    settings.addEventListener('change', event => {
        if (event.target === fields.timePicker) {
            if (fields.timePicker.checked && fields.format.value === fields.format.defaultValue)
                fields.format.value = 'MM/DD/YYYY HH:mm';
            else if (!fields.timePicker.checked && fields.format.value === 'MM/DD/YYYY HH:mm')
                fields.format.value = fields.format.defaultValue;
        }
        refresh();
    });
    settings.addEventListener('reset', () => requestAnimationFrame(refresh));
    copy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(generated.textContent);
            copyStatus.textContent = 'Code copied.';
        } catch {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(generated);
            selection.removeAllRanges();
            selection.addRange(range);
            copyStatus.textContent = 'Code selected. Use your device’s Copy command.';
        }
    });
    refresh();
})();

export = DateRangePicker;
export as namespace DateRangePicker;

declare class DateRangePicker {
    constructor(element: string | Element | ArrayLike<Element>, options?: DateRangePicker.Options,
        callback?: DateRangePicker.Callback);
    static getInstance(element: Element): DateRangePicker | undefined;
    static installJQuery(jquery: unknown, moment?: unknown): typeof DateRangePicker;
    startDate: DateRangePicker.PickerDate;
    /** Null between the first and second clicks of an interactive range selection. */
    endDate: DateRangePicker.PickerDate | null;
    minDate: DateRangePicker.PickerDate | false;
    maxDate: DateRangePicker.PickerDate | false;
    chosenLabel: string | null | undefined;
    isShowing: boolean;
    element: ArrayLike<HTMLElement>;
    container: ArrayLike<HTMLElement>;
    ranges: Record<string, [DateRangePicker.PickerDate, DateRangePicker.PickerDate]>;
    setStartDate(value: DateRangePicker.DateInput): void;
    setEndDate(value: DateRangePicker.DateInput): void;
    setRanges(ranges: DateRangePicker.Ranges | null): void;
    show(): void;
    hide(): void;
    toggle(): void;
    showCalendars(): void;
    hideCalendars(): void;
    move(): void;
    remove(): void;
}

declare namespace DateRangePicker {
    interface PickerDate {
        format(format?: string): string;
        clone(): PickerDate;
        toDate(): Date;
        toISOString(): string;
        valueOf(): number;
        unix(): number;
        isValid(): boolean;
        daysInMonth(): number;
        startOf(unit: string): PickerDate;
        endOf(unit: string): PickerDate;
        add(amount: number | Span, unit?: string): PickerDate;
        subtract(amount: number | Span, unit?: string): PickerDate;
        isSame(other: DateInput, unit?: string): boolean;
        isBefore(other: DateInput, unit?: string): boolean;
        isAfter(other: DateInput, unit?: string): boolean;
        diff(other: DateInput, unit?: string, floatingPoint?: boolean): number;
        year(): number;
        year(value: number): PickerDate;
        month(): number;
        month(value: number): PickerDate;
        date(): number;
        date(value: number): PickerDate;
        day(): number;
        day(value: number): PickerDate;
        hour(): number;
        hour(value: number): PickerDate;
        minute(): number;
        minute(value: number): PickerDate;
        second(): number;
        second(value: number): PickerDate;
        millisecond(): number;
        millisecond(value: number): PickerDate;
        week(): number;
        week(value: number): PickerDate;
        isoWeek(): number;
        isoWeek(value: number): PickerDate;
        isoWeekday(): number;
        isoWeekday(value: number): PickerDate;
        quarter(): number;
        quarter(value: number): PickerDate;
    }
    type DateInput = string | number | Date | number[] | { toDate(): Date };
    type Span = Record<string, number>;
    type Ranges = Record<string, [DateInput, DateInput]>;
    type Callback = (this: DateRangePicker, start: PickerDate, end: PickerDate, label?: string | null) => void;
    interface Locale {
        format?: string;
        separator?: string;
        direction?: 'ltr' | 'rtl';
        applyLabel?: string;
        cancelLabel?: string;
        weekLabel?: string;
        customRangeLabel?: string;
        daysOfWeek?: string[];
        monthNames?: string[];
        firstDay?: number;
    }
    interface Options {
        startDate?: DateInput;
        endDate?: DateInput;
        minDate?: DateInput | false;
        maxDate?: DateInput | false;
        minSpan?: Span;
        maxSpan?: Span;
        dateLimit?: Span;
        ranges?: Ranges;
        locale?: Locale;
        singleCalendar?: boolean;
        singleDatePicker?: boolean;
        linkedCalendars?: boolean;
        alwaysShowCalendars?: boolean;
        showDropdowns?: boolean;
        minYear?: number;
        maxYear?: number;
        showWeekNumbers?: boolean;
        showISOWeekNumbers?: boolean;
        showCustomRangeLabel?: boolean;
        timePicker?: boolean;
        timePicker24Hour?: boolean;
        timePickerSeconds?: boolean;
        timePickerIncrement?: number;
        autoApply?: boolean;
        autoUpdateInput?: boolean;
        applyOnRangeClick?: boolean;
        isInvalidDate?: (date: PickerDate) => boolean;
        isCustomDate?: (date: PickerDate) => false | string | string[];
        parentEl?: string | Element | ArrayLike<Element>;
        template?: string | Element | ArrayLike<Element>;
        opens?: 'left' | 'center' | 'right';
        drops?: 'auto' | 'up' | 'down';
        buttonClasses?: string | string[];
        applyButtonClasses?: string;
        cancelButtonClasses?: string;
        applyClass?: string;
        cancelClass?: string;
    }
}

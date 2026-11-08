import DateRangePicker, { type Options } from 'daterangepicker';
import 'daterangepicker/daterangepicker.css';

const input = document.querySelector<HTMLInputElement>('#dates')!;
const options: Options = { singleCalendar: true };
new DateRangePicker(input, options);


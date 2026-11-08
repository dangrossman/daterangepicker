const DateRangePicker = require('daterangepicker');
require('daterangepicker/daterangepicker.css');

const input = document.querySelector('#dates');
new DateRangePicker(input, { singleCalendar: true });


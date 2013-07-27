# Date Range Picker for Twitter Bootstrap

![Improvely.com](http://i.imgur.com/LbAMf3D.png)

This date range picker component for Twitter Bootstrap 2.x creates a dropdown menu from which a user can 
select a range of dates. I created it while building the UI for [Improvely](http://www.improvely.com), 
which needed a way to select date ranges for reports.

If invoked with no options, it will present two calendars to choose a start 
and end date from. Optionally, you can provide a list of date ranges the user can select from instead 
of choosing dates from the calendars. If attached to a text input, the selected dates will be inserted 
into the text box. Otherwise, you can provide a custom callback function to receive the selection.

**[View a demo](http://www.dangrossman.info/2012/08/20/a-date-range-picker-for-twitter-bootstrap/)**

## Usage

This component relies on [Twitter Bootstrap 2.x](http://twitter.github.com/bootstrap/), 
[Moment.js](http://momentjs.com/) and [jQuery](http://jquery.com/).

Basic usage:

```
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="moment.js"></script>
<script type="text/javascript" src="daterangepicker.js"></script>
<link rel="stylesheet" type="text/css" href="bootstrap.css" />
<link rel="stylesheet" type="text/css" href="daterangepicker.css" />

<script type="text/javascript">
$(document).ready(function() {
  $('input[name="daterange"]').daterangepicker();
});
</script>
```

The constructor also takes an optional options object and callback function. The function will be called whenever 
the selected date range has been changed by the user, and is passed the start and end dates (moment date objects) as 
parameters.

````
$('input[name="daterange"]').daterangepicker(
  { 
    format: 'YYYY-MM-DD',
    startDate: '2013-01-01',
    endDate: '2013-12-31'
  },
  function(start, end) {
    alert("A date range was chosen");
  }
);
````

## Options Reference

`startDate`: (Date object, moment object or string) The start of the initially selected date range

`endDate`: (Date object, moment object or string) The end of the initially selected date range

`minDate`: (Date object, moment object or string) The earliest date a user may select

`maxDate`: (Date object, moment object or string) The latest date a user may select

`dateLimit`: (object) The maximum span between the selected start and end dates. Can have any property you can add to a moment object (i.e. days, months)

`showDropdowns`: (boolean) Show year and month select boxes above calendars to jump to a specific month and year

`showWeekNumbers`: (boolean) Show week numbers at the start of each week on the calendars

`timePicker`: (boolean) Allow selection of dates with times, not just dates

`timePickerIncrement`: (number) Increment of the minutes selection list for times (i.e. 30 to allow only selection of times ending in 0 or 30)

`timePicker12Hour`: (boolean) Use 12-hour instead of 24-hour times, adding an AM/PM select box

`ranges`: (object) Set predefined date ranges the user can select from. Each key is the label for the range, and its value an array with two dates representing the bounds of the range

`opens`: (string: 'left'/'right') Whether the picker appears aligned to the left or to the right of the HTML element it's attached to

`buttonClasses`: (array) CSS class names that will be added to all buttons in the picker

`applyClass`: (string) CSS class name that will be added to the apply button

`clearClass`: (string) CSS class name that will be added to the clear button

`format`: (string) Date/time format string used by moment when parsing or displaying the selected dates

`separator`: (string) Separator string to display between the start and end date when populating a text input the picker is attached to

`locale`: (object) Allows you to provide localized strings for buttons and labels, and the first day of week for the calendars

## License

This code is made available under the same license as Twitter Bootstrap. Moment.js is included in this repository 
for convenience. It is available under the [MIT license](http://www.opensource.org/licenses/mit-license.php).

--

Copyright 2012-2013 Dan Grossman

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Date Range Picker for Bootstrap

![Improvely.com](http://i.imgur.com/LbAMf3D.png)

This date range picker component for Bootstrap creates a dropdown menu from which a user can
select a range of dates. I created it while building the UI for [Improvely](http://www.improvely.com), 
which needed a way to select date ranges for reports.

Features include limiting the selectable date range, localizable strings and date formats,
a single date picker mode, optional time picker (for e.g. making appointments or reservations),
and styles that match the default Bootstrap 3 theme.

## [Documentation and Live Usage Examples](http://www.daterangepicker.com)

## [See It In a Live Application](https://awio.iljmp.com/5/drpdemogh)

## Keyboard interaction
### General
* <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> Navigates through the "focusable" items within the calendar pane. These items include date range labels, apply and cancel buttons, date/time inputs, and calendar grids - although only the currently selected start and end dates will accept focus (once a specific date has focus, use the keys specified in the next section to change which dates can accept/have focus).

### When focused on a specific date
* <kbd>Left</kbd> Move focus to the previous day. Will move to the last day of the previous month, if the current day is the first day of a month.
* <kbd>Right</kbd> Move focus to the next day. Will move to the first day of the following month, if the current day is the last day of a month.
* <kbd>Up</kbd> Move focus to the same day of the previous week. Will wrap to the appropriate day in the previous month.
* <kbd>Down</kbd> Move focus to the same day of the following week. Will wrap to the appropriate day in the following month.
* <kbd>PgUp</kbd> Move focus to the same date of the previous month. If that date does not exist, focus is placed on the last day of the month.
* <kbd>PgDn</kbd> Move focus to the same date of the following month. If that date does not exist, focus is placed on the last day of the month.
* <kbd>Shift+PgUp</kbd> Move focus to the same date of the previous year. If that date does not exist (e.g leap year), focus is placed on the last day of the month.
* <kbd>Shift+PgDn</kbd> Move focus to the same date of the following year. If that date does not exist (e.g leap year), focus is placed on the last day of the month.
* <kbd>Home</kbd> Move to the first day of the month.
* <kbd>End</kbd> Move to the last day of the month.
* <kbd>Enter</kbd> / <kbd>Space</kbd> Simulates a click on the highlighted date (in dual calendar mode, is aware of whether this should be the start or the end date).

### When focused on a navigational arrow
* <kbd>Enter</kbd> / <kbd>Space</kbd> Simulates a click on the highlighted navigational arrow.

### When focused on a date range label
* <kbd>Up</kbd> Move focus to the previous date range label (does not apply selection without user pressing enter/space). Will wrap back around to the bottom of the list if already at the top.
* <kbd>Down</kbd> Move focus to the next date range label (does not apply selection without user pressing enter/space). Will wrap back around to the top of the list if already at the bottom.
* <kbd>Enter</kbd> / <kbd>Space</kbd> Simulates a click on the highlighted date range (making the selection, and applying the range as appropriate).

### When focused on an action button
* <kbd>Enter</kbd> / <kbd>Space</kbd> Simulates a button click on the highlighted action button.

## License

This code is made available under the same license as Bootstrap. Moment.js is included in this repository
for convenience. It is available under the [MIT license](http://www.opensource.org/licenses/mit-license.php).

--

The MIT License (MIT)

Copyright (c) 2012-2017 Dan Grossman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

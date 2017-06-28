# Date Range Picker for Bootstrap based on Dan Grossman's awesome 

This daterangepicker is based on Dan Grossman's [daterangepicker](https://github.com/dangrossman/bootstrap-daterangepicker).

# Main changes
1. The daterangepicker will not execute the callback when clicking outside the calendar modal. The original daterangepicker will execute the callback function as if the user clicked 'Apply' button.
2. User can select a date range by first clicking on a date and then choosing a date in the past. The plugin will determine which date should be a start date and set the end date accordingly. The original plugin would reset the selection, forcing the user to select the end.

![Improvely.com](http://i.imgur.com/0otr1RF.png)

This date range picker component for Bootstrap creates a dropdown menu from which a user can
select a range of dates.

Features include limiting the selectable date range, localizable strings and date formats,
a single date picker mode, optional time picker (for e.g. making appointments or reservations),
and styles that match the default Bootstrap 3 theme.

## [Original Daterangepicker Documentation and Live Usage Examples](http://www.daterangepicker.com)

## [See It In a Live Application](https://awio.iljmp.com/5/drpdemogh)

## License

This code is made available under the same license as Bootstrap. Moment.js is included in this repository
for convenience. It is available under the [MIT license](http://www.opensource.org/licenses/mit-license.php).

--

The MIT License (MIT)

Copyright (c) 2016-2017 Xavier Glab

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

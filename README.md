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

## License

This code is made available under the same license as Bootstrap. Moment.js is included in this repository
for convenience. It is available under the [MIT license](http://www.opensource.org/licenses/mit-license.php).

--

The MIT License (MIT)

Copyright (c) 2012-2015 Dan Grossman

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

## Things added for TBB custom calendar

You can see [code diff](https://github.com/siteminder-au/bootstrap-daterangepicker/compare/v2.1.17...siteminder-au:master) from the original fork (`v2.1.17`)

### DOM element
- Each date cell in the calendars now have date value (`YYYY-DD-MM`
  format) set to `data-date` attribute. This make it easier to select
  date cell from date string.

### Events
- `startDateSelected.daterangepicker`: Triggered when check in date is
  selected
- `endDateSelected.daterangepicker`: Triggered when check out date is
  selected
- `updateCalendar.daterangepicker`: Triggered when calendar view is
  updated

### Options
- `template` now can receive jQuery object. This enable `tamplate` to have
  angular directive.

  ```javascript
  options = { template: $compile(templateHTML)(scope)  }
  ```
- `startDateInput`: jQuery or selector string that overrides default start date input
- `endDateInput`: jQuery or selector string that overrides default end date input
  
### Methods
- `updateMomentLocale`: update view to the given moment locale key

  ```javascript
  // e.g. to update the view and inputs to Thai language
  this.updateMomentLocale('th')
  ```

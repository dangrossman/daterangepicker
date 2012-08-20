# Date Range Picker for Twitter Bootstrap

![Improvely.com](http://www.dangrossman.info/wp-content/themes/2012/daterangepicker.png)

This date range picker component for Twitter Bootstrap creates a dropdown menu from which a user can 
select a range of dates. It was created for the reporting UI at [Improvely](http://www.improvely.com).

If invoked with no options, it will present two calendars to choose a start 
and end date from. Optionally, you can provide a list of date ranges the user can select from instead 
of choosing dates from the calendars. If attached to a text input, the selected dates will be inserted 
into the text box. Otherwise, you can provide a custom callback function to receive the selection.

[Live demo &amp; option usage examples](http://www.dangrossman.info/2012/08/20/a-date-range-picker-for-twitter-bootstrap/)

## Usage

This component relies on [Twitter Bootstrap](http://twitter.github.com/bootstrap/), 
[Datejs](http://www.datejs.com/) and [jQuery](http://jquery.com/).

Basic usage:

```
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="date.js"></script>
<script type="text/javascript" src="daterangepicker.js"></script>
<link rel="stylesheet" type="text/css" href="bootstrap.css" />
<link rel="stylesheet" type="text/css" href="daterangepicker.css" />

<script type="text/javascript">
$(document).ready(function() {
  $('input[name="daterange"]').daterangepicker();
});
</script>
```


## License

This code is made available under the [Apache License v2.0](http://www.apache.org/licenses/LICENSE-2.0), 
the same as Twitter Bootstrap.

Date.js is included in this repository for convenience. It is available under the 
[MIT license](http://www.opensource.org/licenses/mit-license.php).
<!DOCTYPE html>
<html dir="ltr" lang="en-US">
<head>
    <meta charset="UTF-8" />
    <title>Humach DateRangePicker</title>
    <link href="http://netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" media="all" href="daterangepicker.css" />
    <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
    <script type="text/javascript" src="http://netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="moment.js"></script>
    <script type="text/javascript" src="daterangepicker.js"></script>
    
    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>

    <div class="container">
        <div class="page-header">
          <h4>Date Range Picker</h4>
        </div>
        <div class="row">
        	    <div class="col-sm-6">
        	    	    <div class="form-group">
            	    	    <label>Choose range:</label>
            	    	    <input type="text" class="form-control daterange" value="">
                </div>
        	    </div>
        </div>
    </div>
    
<script type="text/javascript">
    $(function () {
    
        $("input.daterange").daterangepicker({
            applyClass: "btn-primary",
            autoUpdateInput: false,
            alwaysShowCalendars: true,
            extraContrast: true,
            showInputLabels: true,
            ranges: {
               'Today': [moment(), moment()],
               'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
               'Last 7 Days': [moment().subtract(6, 'days'), moment()],
               'Last 30 Days': [moment().subtract(29, 'days'), moment()],
               'This Month': [moment().startOf('month'), moment().endOf('month')],
               'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        });

        $('input.daterange').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
            console.log("PICKER", picker);
        });
        
        $('input.daterange').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });
    
    });
</script>
    
</body>
</html>

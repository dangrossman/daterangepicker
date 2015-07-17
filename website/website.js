$(document).ready(function() {
    
    $('.configurator input').change(function() {
      updateConfig();
    });

    $('#config-text').keyup(function() {
      eval($(this).val());
    });

    $('.demo i').click(function() {
      $(this).parent().find('input').click();
    });

    updateConfig();

    function updateConfig() {
      var options = {};

      if ($('#singleDatePicker').is(':checked'))
        options.singleDatePicker = true;
      
      if ($('#showDropdowns').is(':checked'))
        options.showDropdowns = true;

      if ($('#showWeekNumbers').is(':checked'))
        options.showWeekNumbers = true;

      if ($('#timePicker').is(':checked'))
        options.timePicker = true;
      
      if ($('#timePicker24Hour').is(':checked'))
        options.timePicker24Hour = true;

      if ($('#timePickerIncrement').val().length)
        options.timePickerIncrement = parseInt($('#timePickerIncrement').val(), 10);

      if ($('#timePickerSeconds').is(':checked'))
        options.timePickerSeconds = true;
      
      if ($('#autoApply').is(':checked'))
        options.autoApply = true;

      if ($('#dateLimit').is(':checked'))
        options.dateLimit = { days: 7 };

      if ($('#ranges').is(':checked')) {
        options.ranges = {
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        };
      }

      if ($('#locale').is(':checked')) {
        options.locale = {
          format: 'MM/DD/YYYY',
          separator: ' - ',
          applyLabel: 'Apply',
          cancelLabel: 'Cancel',
          fromLabel: 'From',
          toLabel: 'To',
          customRangeLabel: 'Custom',
          daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
          monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          firstDay: 1
        };
      }

      if ($('#parentEl').val().length)
        options.parentEl = $('#parentEl').val();

      if ($('#startDate').val().length) 
        options.startDate = $('#startDate').val();

      if ($('#endDate').val().length)
        options.endDate = $('#endDate').val();
      
      if ($('#minDate').val().length)
        options.minDate = $('#minDate').val();

      if ($('#maxDate').val().length)
        options.maxDate = $('#maxDate').val();

      if ($('#opens').val().length)
        options.opens = $('#opens').val();

      if ($('#drops').val().length)
        options.drops = $('#drops').val();

      if ($('#buttonClasses').val().length)
        options.buttonClasses = $('#buttonClasses').val();

      if ($('#applyClass').val().length)
        options.applyClass = $('#applyClass').val();

      if ($('#cancelClass').val().length)
        options.cancelClass = $('#cancelClass').val();

      $('#config-text').val("$('#config-demo').daterangepicker(" + JSON.stringify(options, null, '    ') + ", function(start, end, label) {\n  console.log(\"New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')\");\n});");

      $('#config-demo').daterangepicker(options, function(start, end, label) { console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')'); });
      
    }

    if ($(window).width() > 980) {
        $('#sidebar').affix({
          offset: {
            top: 300,
            bottom: function () {
              return (this.bottom = $('.footer').outerHeight(true))
            }
          }
        });
    }
    $('body').scrollspy({ target: '#nav-spy', offset: 20 });
});
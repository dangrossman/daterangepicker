<script>
  import { onMount } from 'svelte';
  import DateRangePicker from 'daterangepicker';
  import 'daterangepicker/daterangepicker.css';

  let input;

  onMount(() => {
    const picker = new DateRangePicker(input, { singleCalendar: true });
    return () => picker.remove();
  });
</script>

<label>Report dates<input bind:this={input} type="text" /></label>


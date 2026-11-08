<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DateRangePicker from 'daterangepicker';
import 'daterangepicker/daterangepicker.css';

const input = ref(null);
let picker;

onMounted(() => {
  picker = new DateRangePicker(input.value, { singleCalendar: true });
});

onBeforeUnmount(() => picker?.remove());
</script>

<template>
  <label>Report dates<input ref="input" type="text" /></label>
</template>


import React, { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import DateRangePicker from 'daterangepicker';
import 'daterangepicker/daterangepicker.css';

function ReportDates() {
  const input = useRef(null);

  useEffect(() => {
    const picker = new DateRangePicker(input.current, { singleCalendar: true });
    return () => picker.remove();
  }, []);

  return <label>Report dates<input ref={input} type="text" /></label>;
}

createRoot(document.getElementById('app')).render(
  <StrictMode><ReportDates /></StrictMode>
);


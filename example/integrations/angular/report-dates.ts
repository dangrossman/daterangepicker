import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import DateRangePicker from 'daterangepicker';
import 'daterangepicker/daterangepicker.css';

@Component({
  selector: 'report-dates',
  standalone: true,
  template: '<label>Report dates<input #dates type="text"></label>'
})
export class ReportDates implements AfterViewInit, OnDestroy {
  @ViewChild('dates', { static: true }) input!: ElementRef<HTMLInputElement>;
  private picker?: DateRangePicker;

  ngAfterViewInit() {
    this.picker = new DateRangePicker(this.input.nativeElement, { singleCalendar: true });
  }

  ngOnDestroy() {
    this.picker?.remove();
  }
}


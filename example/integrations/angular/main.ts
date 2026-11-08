import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ReportDates } from './report-dates';

bootstrapApplication(ReportDates, {
  providers: [provideZonelessChangeDetection()]
}).catch(console.error);


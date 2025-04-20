// src/app/services/date-range.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DateRangeService {
  private dateRangeSubject = new BehaviorSubject<{
    start: string;
    end: string;
  }>({
    start: '',
    end: '',
  });

  dateRange$ = this.dateRangeSubject.asObservable();

  setDateRange(start: string, end: string) {
    this.dateRangeSubject.next({ start, end });
  }

  getDateRange(): { start: string; end: string } {
    return this.dateRangeSubject.getValue();
  }
}

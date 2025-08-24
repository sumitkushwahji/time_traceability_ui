import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private filterSubject = new BehaviorSubject<string>('NAVIC'); // Default to NavIC (IRNSS) data
  filter$ = this.filterSubject.asObservable();

  setFilter(value: string) {
    this.filterSubject.next(value);
  }

  getCurrentFilter(): string {
    return this.filterSubject.value;
  }
}

// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SatData } from './sat-data.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private dataSubject = new BehaviorSubject<SatData[]>([]);
  data$ = this.dataSubject.asObservable();

  setData(data: SatData[]): void {
    this.dataSubject.next(data);
  }

  getData(): SatData[] {
    return this.dataSubject.getValue();
  }
}

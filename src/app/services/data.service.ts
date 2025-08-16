// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SatData, SatData2, SatDataService } from './sat-data.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private dataSubject = new BehaviorSubject<SatData[]>([]);
  data$ = this.dataSubject.asObservable();

  constructor(private satDataService: SatDataService) {}

  setData(data: SatData[]): void {
    this.dataSubject.next(data);
  }

  getData(): SatData[] {
    return this.dataSubject.getValue();
  }

  /**
   * Get pivoted data for plot visualization
   * For home page (all data) or location-specific data
   */
  getPivotedSatDataForPlot(
    identifier?: string,
    startDate?: string,
    endDate?: string
  ): Observable<SatData2[]> {
    return this.satDataService.getPivotedSatDataForPlot(identifier, startDate, endDate);
  }
}

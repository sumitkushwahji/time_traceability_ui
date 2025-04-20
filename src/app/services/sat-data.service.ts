// src/app/services/sat-data.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SatData {
  id: string;
  satLetter: string;
  mjd: number;
  sttime: string;
  mjdDateTime: string;
  source1: string;
  source2: string;
  avg1: number;
  avg2: number;
  avgRefsysDifference: number;
}

@Injectable({
  providedIn: 'root',
})
export class SatDataService {
  private readonly baseUrl = 'http://localhost:8082/api/data/sat-differences';

  constructor(private http: HttpClient) {}

  getSatData(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    search: string,
    startDate?: string,
    endDate?: string
  ): Observable<{ content: SatData[]; totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('search', search.trim());

    if (startDate) {
      params = params.set('startDate', this.formatDateOnly(startDate));
    }
    if (endDate) {
      params = params.set('endDate', this.formatDateOnly(endDate));
    }

    return this.http.get<{ content: SatData[]; totalElements: number }>(
      this.baseUrl,
      { params }
    );
  }

  private formatDateOnly(dateString: string): string {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

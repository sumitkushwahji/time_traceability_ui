// src/app/services/sat-data.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Adjust path if needed

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

export interface SatData2 {
  satLetter: string;
  mjd: number;
  mjdDateTime: string;
  sttime: string;
  locationDiffs: {
    [location: string]: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SatDataService {
  private readonly baseUrl = `${environment.apiBaseUrl}/sat-differences`;
  private readonly baseUrl2 = environment.apiBaseUrl; // Often used for common base URL

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

  // NEW method: get paginated SatData for a specific identifier
  // src/app/services/sat-data.service.ts

  getPaginatedSatDataBySource2(
    source2: string,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    search: string,
    startDate: string,
    endDate: string
  ): Observable<{ content: SatData[]; totalElements: number }> {
    let params = new HttpParams()
      .set('source2', source2)
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('search', search || '');

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

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

  getPivotedSatData(
    startDate?: string,
    endDate?: string,
    source1?: string
  ): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (source1) params = params.set('source1', source1);

    return this.http.get<any[]>(`${this.baseUrl2}/sat-differences-pivoted`, {
      params,
    });
  }

  // NEW method: fetch pivoted data for a specific identifier (e.g., city)
  getPivotedSatDataByIdentifier(
    identifier: string, // e.g., 'ahmedabad', 'bangalore'
    startDate?: string,
    endDate?: string,
    source1?: string
  ): Observable<any[]> {
    let params = new HttpParams().set('identifier', identifier); // Add identifier to params
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (source1) params = params.set('source1', source1);

    return this.http.get<any[]>(
      `${this.baseUrl2}/sat-differences-pivoted`, // Use your actual endpoint
      { params }
    );
  }

  // NEW method: fetch pivoted data typed as SatData2[] for plot, potentially for a specific identifier
  // Renamed to be more generic, and added identifier parameter
  getPivotedSatDataForPlot(
    identifier?: string, // Optional identifier for plot data
    startDate?: string,
    endDate?: string
  ): Observable<SatData2[]> {
    let params = new HttpParams();
    if (identifier) params = params.set('identifier', identifier); // Add identifier if provided
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params = params.set('endDate', endDate);

    return this.http.get<SatData2[]>(
      `${this.baseUrl2}/sat-differences-pivoted`, // Use your actual endpoint for plot data
      { params }
    );
  }
}

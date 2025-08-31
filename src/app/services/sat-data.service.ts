// src/app/services/sat-data.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Adjust path if needed
import { PlatformService } from './platform.service';

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
// Define the data structure for a single row of pivoted data
export interface SatPivotedData {
  id: string;
  satLetter: string;
  mjd: number;
  mjdDateTime: string;
  sttime: string;
  locationDiffs: { [key: string]: number };
}

// Define the structure of the paginated API response
export interface PivotedDataResponse {
  content: SatPivotedData[];
  totalElements: number;
}

@Injectable({
  providedIn: 'root',
})
export class SatDataService {
  private readonly baseUrl = `${environment.apiBaseUrl}/data/sat-differences`;
  private readonly baseUrl2 = `${environment.apiBaseUrl}/data`; // Often used for common base URL
  private readonly optimizedUrl = `${environment.apiBaseUrl}/data/optimized-sat-differences`;
  private readonly bulkUrl = `${environment.apiBaseUrl}/data/bulk-location-data`;


  constructor(
    private http: HttpClient,
    private platformService: PlatformService
  ) {}

  /**
   * Handle HTTP errors gracefully, especially during SSR/prerendering
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // During SSR/prerendering, return empty result instead of throwing
      if (!this.platformService.isBrowser()) {
        console.warn(`${operation} failed during SSR, returning empty result:`, error?.message || error);
        return of(result as T);
      }
      
      // In browser, log error and return empty result
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }

  // --- NEW METHOD FOR PIVOTED DATA VIEW ---
  /**
   * Gets paginated and filtered data from the pivoted materialized view.
   * @param page - The page number (0-indexed).
   * @param size - The number of items per page.
   * @param startDate - The start of the date range (ISO string format).
   * @param endDate - The end of the date range (ISO string format).
   * @param satLetter - The satellite system to filter by (e.g., 'GPS', 'NAVIC').
   * @returns An Observable of the paginated pivoted data.
   */
  getPivotedSatData2(
    page: number,
    size: number,
    startDate?: string,
    endDate?: string,
    satLetter?: string
  ): Observable<PivotedDataResponse> {
    const url = `${this.baseUrl2}/pivoted-sat-data`;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'mjd_date_time') // Default sort as required by the view
      .set('sortDirection', 'desc');

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (satLetter && satLetter.toUpperCase() !== 'ALL') {
      params = params.set('satLetter', satLetter);
    }

    return this.http.get<PivotedDataResponse>(url, { params }).pipe(
      catchError(this.handleError<PivotedDataResponse>('getPivotedSatData', { content: [], totalElements: 0 }))
    );
  }




  getSatData(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    search: string,
    startDate?: string,
    endDate?: string,
    satLetter?: string | null // 🎯 ADDED: satLetter parameter, can be string or null
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
    // 🎯 ADDED: Conditionally set satLetter parameter
    if (satLetter) { // Only add if it's not null or empty
      params = params.set('satLetter', satLetter);
    }

    return this.http.get<{ content: SatData[]; totalElements: number }>(
      this.baseUrl,
      { params }
    ).pipe(
      catchError(this.handleError('getSatData', { content: [], totalElements: 0 }))
    );
  }

  // NEW method: get paginated SatData for a specific identifier
  getPaginatedSatDataBySource2(
    source2: string[] | null, // 🎯 FIX: Changed type from 'string' to 'string[] | null'
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    search: string,
    startDate: string,
    endDate: string,
    satLetter: string | null
  ): Observable<{ content: SatData[]; totalElements: number }> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('search', search || '');

    if (source2 && source2.length > 0) {
      source2.forEach((s) => {
        params = params.append('source2', s);
      });
    }

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (satLetter) {
      params = params.set('satLetter', satLetter);
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

  // 🚀 NEW OPTIMIZED METHODS FOR PERFORMANCE

  /**
   * Get bulk data for location - optimized for fast loading
   * Uses new backend endpoint that returns all data at once
   */
  getBulkLocationData(
    source2: string[],
    startDate?: string,
    endDate?: string
  ): Observable<{ data: SatData[]; totalElements: number; cached: boolean }> {
    let params = new HttpParams();
    
    // Add source2 array as multiple parameters
    source2.forEach(location => {
      params = params.append('source2', location);
    });
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<{ data: SatData[]; totalElements: number; cached: boolean }>(
      this.bulkUrl, 
      { params }
    ).pipe(
      catchError(this.handleError('getBulkLocationData', { data: [], totalElements: 0, cached: false }))
    );
  }

  /**
   * Get optimized paginated data using indexed columns only
   */
  getOptimizedSatData(
    source2: string[],
    page: number,
    size: number,
    sortBy: string = 'mjdDateTime',
    sortDirection: string = 'desc',
    startDate?: string,
    endDate?: string,
    satLetter?: string | null
  ): Observable<{ content: SatData[]; totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Add source2 array as multiple parameters
    source2.forEach(location => {
      params = params.append('source2', location);
    });

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (satLetter && satLetter !== 'ALL') params = params.set('satLetter', satLetter);

    return this.http.get<{ content: SatData[]; totalElements: number }>(
      this.optimizedUrl,
      { params }
    ).pipe(
      catchError(this.handleError('getOptimizedSatData', { content: [], totalElements: 0 }))
    );
  }
}
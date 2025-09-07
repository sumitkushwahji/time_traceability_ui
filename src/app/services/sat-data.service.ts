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

// Interface for the file status data returned by the new endpoint
export interface FileStatus {
  source: string;
  mjd: number;
  status: 'AVAILABLE' | 'MISSING' | 'WAITING'; // The possible statuses
  fileName: string;
  lastUpdated: string; // The timestamp from the backend
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
  private readonly baseUrl4 = `${environment.apiBaseUrl}/status/file-availability`;
  private readonly baseUrl2 = `${environment.apiBaseUrl}/data`; // Often used for common base URL
 
 


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



  /**
   * Fetches the file availability statuses for a given set of sources and a date range.
   * This method is called by the FileStatusGridComponent.
   *
   * @param sources An array of source names (e.g., ['IRLMB1', 'IRLMB2']).
   * @param startDate The start of the date range in 'yyyy-MM-dd' format.
   * @param endDate The end of the date range in 'yyyy-MM-dd' format.
   * @returns An Observable array of FileStatus objects.
   */
  getFileStatuses(sources: string[], startDate: string, endDate: string): Observable<FileStatus[]> {
    const url = `${this.baseUrl4}`;

    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    // Append each source to the HttpParams. This creates a query like:
    // ?sources=IRLMB1&sources=IRLMB2...
    sources.forEach(source => {
      params = params.append('sources', source);
    });

    return this.http.get<FileStatus[]>(url, { params }).pipe(
      catchError(this.handleError<FileStatus[]>('getFileStatuses', []))
    );
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
      `${this.baseUrl2}/optimized-sat-differences`,
      { params }
    ).pipe(
      catchError(this.handleError('getOptimizedSatData', { content: [], totalElements: 0 }))
    );
  }
}
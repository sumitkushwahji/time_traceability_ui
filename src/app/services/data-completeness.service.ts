import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// Import your environment

interface SourceSessionStatus {
  source: string;
  mjd: string;
  currentSessionCount: number;
  expectedSessionCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataCompletenessService {
  private apiUrl = environment.apiUrl; // Get the base API URL

  constructor(private http: HttpClient) {}

  getSessionCompleteness(mjd: string): Observable<SourceSessionStatus[]> {
    return this.http.get<SourceSessionStatus[]>(
      `${this.apiUrl}/session-completeness?mjd=${mjd}` // Use the full URL
    );
  }

  getAvailableMjds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available-mjds`); // Use the full URL
  }

  getCurrentMjd(): string {
    const today = new Date();
    const epochDays = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    return String(epochDays + 40587);
  }
}

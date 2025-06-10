import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SourceSessionStatus } from '../models/session-status.model';

@Injectable({ providedIn: 'root' })
export class SessionStatusService {
  private readonly baseUrl =
    'https://rrsl.bharatsamay.org/time-traceability-service/api/data/session-completeness';

  constructor(private http: HttpClient) {}

  getSessionStatus(mjd?: string): Observable<SourceSessionStatus[]> {
    const url = mjd ? `${this.baseUrl}?mjd=${mjd}` : this.baseUrl;
    return this.http.get<SourceSessionStatus[]>(url);
  }
}

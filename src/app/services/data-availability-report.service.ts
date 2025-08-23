// src/app/services/data-availability-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DataAvailabilityReport {
  overallSummary: OverallSummary;
  fileUploads: FileUploadDetail[];
  dataGaps: DataGapsAnalysis;
  locationCoverage: LocationCoverage[];
  satelliteAvailability: SatelliteAvailability[];
  timeSeriesFlow: TimeSeriesDataFlow;
  qualitySummary: DataQualitySummary;
  reportGenerated: string;
  reportPeriod: string;
}

export interface OverallSummary {
  totalRecords: number;
  totalFiles: number;
  uniqueLocations: number;
  uniqueSatellites: number;
  overallCompleteness: number;
  missingDataPeriods: number;
  firstDataPoint: string;
  lastDataPoint: string;
  healthStatus: 'GOOD' | 'MODERATE' | 'POOR';
}

export interface FileUploadDetail {
  fileName: string;
  mjd: string;
  uploadTime: string;
  recordsCount: number;
  locationsInFile: string[];
  satellitesInFile: string[];
  processingStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  issues: string[];
  processingTimeMs: number;
}

export interface DataGapsAnalysis {
  missingPeriods: MissingPeriod[];
  missingLocations: string[];
  missingSatellites: string[];
  expectedVsActualRatio: number;
  recommendations: string[];
}

export interface MissingPeriod {
  startTime: string;
  endTime: string;
  location: string;
  satellite: string;
  reason: string;
  expectedRecords: number;
  actualRecords: number;
}

export interface LocationCoverage {
  locationName: string;
  source2: string;
  totalRecords: number;
  completenessPercentage: number;
  firstData: string;
  lastData: string;
  availableSatellites: string[];
  satelliteRecordCounts: { [key: string]: number };
  missingTimeSlots: string[];
  coverageStatus: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
}

export interface SatelliteAvailability {
  satelliteSystem: string;
  satelliteLetter: string;
  totalRecords: number;
  availableLocations: string[];
  locationRecordCounts: { [key: string]: number };
  firstObservation: string;
  lastObservation: string;
  availabilityPercentage: number;
  dataGaps: string[];
  healthStatus: 'ACTIVE' | 'INTERMITTENT' | 'INACTIVE';
}

export interface TimeSeriesDataFlow {
  timeLabels: string[];
  recordsPerHour: number[];
  recordsPerDay: number[];
  locationTimeSeries: { [key: string]: number[] };
  satelliteTimeSeries: { [key: string]: number[] };
  peakDataTimes: string[];
  lowDataTimes: string[];
}

export interface DataQualitySummary {
  overallQualityScore: number;
  validRecords: number;
  outlierRecords: number;
  corruptedRecords: number;
  locationQualityScores: { [key: string]: number };
  satelliteQualityScores: { [key: string]: number };
  qualityIssues: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DataAvailabilityReportService {
  private readonly baseUrl = `${environment.apiBaseUrl}/statistics`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive data availability report
   */
  getDataAvailabilityReport(startDate?: string, endDate?: string): Observable<DataAvailabilityReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<DataAvailabilityReport>(`${this.baseUrl}/data-availability-report`, { params });
  }
}

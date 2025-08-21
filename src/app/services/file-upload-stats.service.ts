import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// DTOs matching the backend structure
export interface FileUploadStatsDTO {
  summary: SummaryStats;
  dailyStats: DailyUploadStats[];
  locationStats: LocationUploadStats[];
  fileTypeStats: FileTypeStats[];
  hourlyPatterns: HourlyUploadPattern[];
  missingFiles: MissingFileInfo[];
  performanceStats: ProcessingPerformanceStats[];
  recentUploads: RecentFileUpload[];
  filesWithErrors: FileWithErrors[];
}

export interface SummaryStats {
  totalFiles: number;
  totalRecords: number;
  averageQuality: number;
  uniqueLocations: number;
  reportPeriodStart: string;
  reportPeriodEnd: string;
  lastGenerated: string;
}

export interface DailyUploadStats {
  uploadDate: string;
  dateTime: string;
  fileCount: number;
  totalRecords: number;
  uniqueLocations: number;
  averageQuality: number;
  completenessPercentage: number;
}

export interface LocationUploadStats {
  locationName: string;
  source2Code: string;
  fileCount: number;
  totalRecords: number;
  firstUpload: string;
  lastUpload: string;
  averageQuality: number;
  successfulFiles: number;
  failedFiles: number;
  successRate: number;
  status: string; // ACTIVE, INACTIVE, INTERMITTENT
}

export interface FileTypeStats {
  fileType: string;
  fileCount: number;
  totalRecords: number;
  averageProcessingTime: number;
  percentage: number;
}

export interface HourlyUploadPattern {
  hour: number;
  fileCount: number;
  totalRecords: number;
  percentage: number;
  peakIndicator: string; // PEAK, NORMAL, LOW
}

export interface MissingFileInfo {
  mjd: number;
  locationName: string;
  status: string; // MISSING, LATE, EXPECTED
  expectedFileName: string;
  daysMissing: number;
  severity: string; // HIGH, MEDIUM, LOW
}

export interface ProcessingPerformanceStats {
  locationName: string;
  fileCount: number;
  averageProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  averageFileSizeMB: number;
  averageLinesProcessed: number;
  totalLinesSkipped: number;
  performanceGrade: string; // A, B, C, D, F
}

export interface RecentFileUpload {
  fileName: string;
  locationName: string;
  source2Code: string;
  mjd: number;
  uploadTimestamp: string;
  totalRecords: number;
  fileStatus: string;
  qualityScore: number;
  satellites: string;
  processingTimeMs: number;
}

export interface FileWithErrors {
  fileName: string;
  locationName: string;
  mjd: number;
  uploadTimestamp: string;
  totalRecords: number;
  linesSkipped: number;
  processingErrors: string;
  errorRate: number;
  severity: string; // HIGH, MEDIUM, LOW
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadStatsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/statistics`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive file upload statistics
   */
  getFileUploadStatistics(startDate?: string, endDate?: string): Observable<FileUploadStatsDTO> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<FileUploadStatsDTO>(`${this.baseUrl}/file-upload-stats`, { params });
  }

  /**
   * Get file upload statistics for a specific location
   */
  getLocationFileUploads(locationName: string): Observable<RecentFileUpload[]> {
    return this.http.get<RecentFileUpload[]>(`${this.baseUrl}/file-upload-stats/location/${locationName}`);
  }

  /**
   * Get file upload statistics for a specific MJD
   */
  getMjdFileUploads(mjd: number): Observable<RecentFileUpload[]> {
    return this.http.get<RecentFileUpload[]>(`${this.baseUrl}/file-upload-stats/mjd/${mjd}`);
  }
}

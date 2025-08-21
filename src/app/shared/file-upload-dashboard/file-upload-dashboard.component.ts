import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartConfiguration } from 'chart.js';

import { 
  FileUploadStatsService, 
  FileUploadStatsDTO, 
  SummaryStats,
  DailyUploadStats,
  LocationUploadStats,
  FileTypeStats,
  HourlyUploadPattern,
  MissingFileInfo,
  ProcessingPerformanceStats,
  RecentFileUpload,
  FileWithErrors
} from '../../services/file-upload-stats.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-file-upload-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './file-upload-dashboard.component.html',
  styleUrls: ['./file-upload-dashboard.component.css']
})
export class FileUploadDashboardComponent implements OnInit, OnDestroy {
  
  // Data properties
  statsData: FileUploadStatsDTO | null = null;
  
  // Filter properties
  startDate: string = '';
  endDate: string = '';
  
  // UI State
  activeTab: string = 'overview';
  loading: boolean = false;
  error: string = '';
  
  // Chart data
  dailyTrendsChart: ChartData<'line'> = { labels: [], datasets: [] };
  locationDistributionChart: ChartData<'bar'> = { labels: [], datasets: [] };
  fileTypeChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  hourlyPatternChart: ChartData<'bar'> = { labels: [], datasets: [] };
  performanceChart: ChartData<'bar'> = { labels: [], datasets: [] };
  
  // Chart options
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  constructor(
    private fileUploadStatsService: FileUploadStatsService,
    private exportService: ExportService
  ) {
    // Set default dates (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.endDate = now.toISOString().slice(0, 16);
    this.startDate = thirtyDaysAgo.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    // Clean up if needed
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Data loading
  async loadStatistics(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      this.fileUploadStatsService.getFileUploadStatistics(this.startDate, this.endDate)
        .subscribe({
          next: (stats) => {
            this.statsData = stats;
            this.updateCharts();
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load file upload statistics: ' + error.message;
            this.loading = false;
          }
        });
      
    } catch (error) {
      this.error = 'Failed to load file upload statistics: ' + (error as Error).message;
      this.loading = false;
    }
  }

  // Chart updates
  private updateCharts(): void {
    if (!this.statsData) return;
    
    this.updateDailyTrendsChart();
    this.updateLocationDistributionChart();
    this.updateFileTypeChart();
    this.updateHourlyPatternChart();
    this.updatePerformanceChart();
  }
  
  private updateDailyTrendsChart(): void {
    const dailyStats = this.statsData!.dailyStats;
    
    this.dailyTrendsChart = {
      labels: dailyStats.map(d => new Date(d.uploadDate).toLocaleDateString()),
      datasets: [
        {
          label: 'Files Uploaded',
          data: dailyStats.map(d => d.fileCount),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        },
        {
          label: 'Total Records',
          data: dailyStats.map(d => d.totalRecords),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
          yAxisID: 'y1'
        }
      ]
    };
  }
  
  private updateLocationDistributionChart(): void {
    const locationStats = this.statsData!.locationStats;
    
    this.locationDistributionChart = {
      labels: locationStats.map(l => l.locationName),
      datasets: [
        {
          label: 'Files Uploaded',
          data: locationStats.map(l => l.fileCount),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
            '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
          ]
        }
      ]
    };
  }
  
  private updateFileTypeChart(): void {
    const fileTypeStats = this.statsData!.fileTypeStats;
    
    this.fileTypeChart = {
      labels: fileTypeStats.map(f => f.fileType),
      datasets: [{
        data: fileTypeStats.map(f => f.percentage),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
      }]
    };
  }
  
  private updateHourlyPatternChart(): void {
    const hourlyPatterns = this.statsData!.hourlyPatterns;
    
    this.hourlyPatternChart = {
      labels: hourlyPatterns.map(h => `${h.hour}:00`),
      datasets: [
        {
          label: 'Upload Activity %',
          data: hourlyPatterns.map(h => h.percentage),
          backgroundColor: hourlyPatterns.map(h => 
            h.peakIndicator === 'PEAK' ? '#EF4444' : 
            h.peakIndicator === 'NORMAL' ? '#F59E0B' : '#10B981'
          )
        }
      ]
    };
  }
  
  private updatePerformanceChart(): void {
    const performanceStats = this.statsData!.performanceStats;
    
    this.performanceChart = {
      labels: performanceStats.map(p => p.locationName),
      datasets: [
        {
          label: 'Avg Processing Time (ms)',
          data: performanceStats.map(p => p.averageProcessingTime),
          backgroundColor: performanceStats.map(p => {
            switch(p.performanceGrade) {
              case 'A': return '#10B981';
              case 'B': return '#84CC16';
              case 'C': return '#F59E0B';
              case 'D': return '#F97316';
              default: return '#EF4444';
            }
          })
        }
      ]
    };
  }

  // Helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': case 'SUCCESS':
        return 'text-green-600 bg-green-100';
      case 'INTERMITTENT': case 'PARTIAL':
        return 'text-yellow-600 bg-yellow-100';
      case 'INACTIVE': case 'FAILED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
  
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
  
  getPerformanceGradeClass(grade: string): string {
    switch (grade) {
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
  
  formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }
  
  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }
  
  formatFileSize(sizeInMB: number): string {
    if (sizeInMB < 1) return (sizeInMB * 1024).toFixed(1) + ' KB';
    return sizeInMB.toFixed(1) + ' MB';
  }
  
  formatDuration(ms: number): string {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return Math.round(ms/1000) + 's';
    return Math.round(ms/60000) + 'm';
  }

  // Export functions
  exportDailyStats(): void {
    if (!this.statsData?.dailyStats) return;
    this.exportService.exportAsCSV(this.statsData.dailyStats, `daily_upload_stats_${new Date().getTime()}.csv`);
  }
  
  exportLocationStats(): void {
    if (!this.statsData?.locationStats) return;
    this.exportService.exportAsCSV(this.statsData.locationStats, `location_upload_stats_${new Date().getTime()}.csv`);
  }
  
  exportMissingFiles(): void {
    if (!this.statsData?.missingFiles) return;
    this.exportService.exportAsCSV(this.statsData.missingFiles, `missing_files_${new Date().getTime()}.csv`);
  }
  
  exportPerformanceStats(): void {
    if (!this.statsData?.performanceStats) return;
    this.exportService.exportAsCSV(this.statsData.performanceStats, `performance_stats_${new Date().getTime()}.csv`);
  }
  
  exportRecentUploads(): void {
    if (!this.statsData?.recentUploads) return;
    this.exportService.exportAsCSV(this.statsData.recentUploads, `recent_uploads_${new Date().getTime()}.csv`);
  }
  
  exportFilesWithErrors(): void {
    if (!this.statsData?.filesWithErrors) return;
    this.exportService.exportAsCSV(this.statsData.filesWithErrors, `files_with_errors_${new Date().getTime()}.csv`);
  }
}

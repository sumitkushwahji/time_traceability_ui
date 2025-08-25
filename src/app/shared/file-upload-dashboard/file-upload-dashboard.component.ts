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
  
  // Location name mapping with abbreviations
  private readonly locationNameMap: { [key: string]: string } = {
    'ahmedabad': 'Ahmedabad (AHM)',
    'bangalore': 'Bangalore (BLR)', 
    'faridabad': 'Faridabad (FBD)',
    'bhubaneshwar': 'Bhubaneshwar (BHU)',
    'guwahati': 'Guwahati (GUW)',
    'drc': 'DRC (DRC)',
    'delhi': 'Delhi (DEL)',
    'mumbai': 'Mumbai (MUM)',
    'kolkata': 'Kolkata (KOL)',
    'chennai': 'Chennai (CHN)',
    'hyderabad': 'Hyderabad (HYD)',
    'pune': 'Pune (PUN)'
  };

  // Source code to satellite system mapping
  private readonly sourceCodeToSatelliteMap: { [key: string]: string } = {
    // GPS receivers
    'GZLI2P': 'GPS',
    'GZLMB1': 'GPS', 
    'GZLMB2': 'GPS',
    'GZLMA2': 'GPS',
    'GZLMF1': 'GPS',
    'GZLMF2': 'GPS',
    'GZLGU1': 'GPS',
    'GZLBH1': 'GPS',
    
    // NAVIC receivers  
    'IRNPLI': 'NAVIC',
    'IRLMB1': 'NAVIC',
    'IRLMB2': 'NAVIC',
    'IRAHM1': 'NAVIC',
    'IRACCO': 'NAVIC',
    'IRGU1': 'NAVIC',
    'IRBH1': 'NAVIC',
    
    // Multi-constellation receivers
    'MULTI1': 'GPS+NAVIC',
    'MULTI2': 'GPS+NAVIC+GLO'
  };

  // Source code to display name mapping
  private readonly sourceCodeToDisplayNameMap: { [key: string]: string } = {
    // GPS receivers (GZL prefix)
    'GZLI2P': 'NPLI_GPS',
    'GZLMB1': 'BLR_TS1',
    'GZLMB2': 'BLR_TS2', 
    'GZLMA2': 'AHM_TS1',
    'GZLMF1': 'FRD_TS1',
    'GZLMF2': 'FRD_TS2',
    'GZLGU1': 'GUW_TS1',
    'GZLBH1': 'BHU_TS1',
    
    // NAVIC receivers (IR prefix)
    'IRNPLI': 'NPLI_NAVIC',
    'IRLMB1': 'BLR_TS1',
    'IRLMB2': 'BLR_TS2',
    'IRAHM1': 'AHM_TS1', 
    'IRACCO': 'FRD_TS1',
    'IRGU1': 'GUW_TS1',
    'IRBH1': 'BHU_TS1'
  };
  
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

  // Satellite system colored x-axis options
  satelliteSystemChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
      x: {
        ticks: {
          color: (context: any) => {
            const locationStats = this.statsData?.locationStats || [];
            const label = context.chart.data.labels[context.index];
            // Find the source code for this display name
            const stat = locationStats.find(l => this.getSourceCodeDisplayName(l.source2Code) === label);
            if (stat) {
              const satellite = this.getSatelliteSystem(stat.source2Code);
              if (satellite === 'GPS') return '#10B981'; // Green for GPS
              if (satellite === 'NAVIC') return '#3B82F6'; // Blue for NAVIC  
              if (satellite === 'GLONASS') return '#8B5CF6'; // Purple for GLONASS
            }
            return '#6B7280'; // Gray for unknown
          }
        }
      }
    }
  };

  // Performance chart options with legend
  performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
      x: {
        ticks: {
          color: (context: any) => {
            const performanceStats = this.statsData?.performanceStats || [];
            const label = context.chart.data.labels[context.index];
            // Find the source code for this display name
            const stat = performanceStats.find(p => this.getSourceCodeDisplayName(p.locationName) === label);
            if (stat) {
              const satellite = this.getSatelliteSystem(stat.locationName);
              if (satellite === 'GPS') return '#10B981'; // Green for GPS
              if (satellite === 'NAVIC') return '#3B82F6'; // Blue for NAVIC
              if (satellite === 'GLONASS') return '#8B5CF6'; // Purple for GLONASS
            }
            return '#6B7280'; // Gray for unknown
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  constructor(
    private fileUploadStatsService: FileUploadStatsService,
    private exportService: ExportService
  ) {
  // Set default dates (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
  this.endDate = now.toISOString().slice(0, 16);
  this.startDate = sevenDaysAgo.toISOString().slice(0, 16);
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
      labels: locationStats.map(l => this.getChartLocationDisplay(l.source2Code)),
      datasets: [
        {
          label: 'Files Uploaded',
          data: locationStats.map(l => l.fileCount),
          backgroundColor: locationStats.map(l => this.getSatelliteSystemChartColor(l.source2Code))
        }
      ]
    };
  }
  
  getDisplayLocationName(locationName: string): string {
    // First check if it's already a proper display name
    if (Object.values(this.locationNameMap).includes(locationName)) {
      return locationName;
    }
    
    // Check if it's a key that needs mapping
    const lowerName = locationName.toLowerCase();
    if (this.locationNameMap[lowerName]) {
      return this.locationNameMap[lowerName];
    }
    
    // If no mapping found, capitalize first letter
    return locationName.charAt(0).toUpperCase() + locationName.slice(1).toLowerCase();
  }

  getSatelliteSystem(sourceCode: string): string {
    return this.sourceCodeToSatelliteMap[sourceCode] || 'Unknown';
  }

  getSourceCodeDisplayName(sourceCode: string): string {
    return this.sourceCodeToDisplayNameMap[sourceCode] || sourceCode;
  }

  getLocationDisplayWithSatellite(locationName: string, sourceCode: string): string {
    const displayName = this.getDisplayLocationName(locationName);
    const satellite = this.getSatelliteSystem(sourceCode);
    return `${displayName} - ${satellite}`;
  }

  getFullLocationDisplay(sourceCode: string): string {
    const displayName = this.getSourceCodeDisplayName(sourceCode);
    const satellite = this.getSatelliteSystem(sourceCode);
    return `${displayName}\n(${sourceCode})\n${satellite}`;
  }

  getChartLocationDisplay(sourceCode: string): string {
    const displayName = this.getSourceCodeDisplayName(sourceCode);
    return displayName; // Just return the display name without satellite system since it's color-coded
  }

  getSatelliteSystemChartColor(sourceCode: string): string {
    const satellite = this.getSatelliteSystem(sourceCode);
    switch(satellite) {
      case 'GPS': return '#3B82F6'; // Blue
      case 'NAVIC': return '#10B981'; // Green  
      case 'GLONASS': return '#8B5CF6'; // Purple
      default: return '#6B7280'; // Gray
    }
  }

  getPerformanceChartColor(sourceCode: string, performanceGrade: string): string {
    const satellite = this.getSatelliteSystem(sourceCode);
    // Base colors for satellite systems with performance grade opacity variations
    switch(satellite) {
      case 'GPS':
        switch(performanceGrade) {
          case 'A': return '#1D4ED8'; // Dark blue
          case 'B': return '#3B82F6'; // Normal blue
          case 'C': return '#60A5FA'; // Light blue
          case 'D': return '#93C5FD'; // Lighter blue
          default: return '#BFDBFE'; // Lightest blue
        }
      case 'NAVIC':
        switch(performanceGrade) {
          case 'A': return '#059669'; // Dark green
          case 'B': return '#10B981'; // Normal green
          case 'C': return '#34D399'; // Light green
          case 'D': return '#6EE7B7'; // Lighter green
          default: return '#A7F3D0'; // Lightest green
        }
      case 'GLONASS':
        switch(performanceGrade) {
          case 'A': return '#7C3AED'; // Dark purple
          case 'B': return '#8B5CF6'; // Normal purple
          case 'C': return '#A78BFA'; // Light purple
          case 'D': return '#C4B5FD'; // Lighter purple
          default: return '#DDD6FE'; // Lightest purple
        }
      default:
        switch(performanceGrade) {
          case 'A': return '#374151'; // Dark gray
          case 'B': return '#6B7280'; // Normal gray
          case 'C': return '#9CA3AF'; // Light gray
          case 'D': return '#D1D5DB'; // Lighter gray
          default: return '#E5E7EB'; // Lightest gray
        }
    }
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
      labels: performanceStats.map(p => this.getChartLocationDisplay(p.locationName)),
      datasets: [
        {
          label: 'Avg Processing Time (ms)',
          data: performanceStats.map(p => p.averageProcessingTime),
          backgroundColor: performanceStats.map(p => {
            // Performance-based coloring: <2s=green, 2-5s=blue, 5-10s=orange, >10s=red
            const timeInSeconds = p.averageProcessingTime / 1000;
            if (timeInSeconds < 2) return '#10B981'; // Green (excellent)
            else if (timeInSeconds < 5) return '#3B82F6'; // Blue (good)
            else if (timeInSeconds < 10) return '#F59E0B'; // Orange (average)
            else return '#EF4444'; // Red (slow)
          })
        }
      ]
    };
  }

  // Helper methods
  getSatelliteSystemClass(satelliteSystem: string): string {
    switch(satelliteSystem) {
      case 'NAVIC': return 'bg-blue-100 text-blue-800';
      case 'GPS': return 'bg-green-100 text-green-800';
      case 'GPS+NAVIC': return 'bg-purple-100 text-purple-800';
      case 'GPS+NAVIC+GLO': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

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

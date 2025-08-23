import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { DataAvailabilityReportService, DataAvailabilityReport } from '../../services/data-availability-report.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-data-availability-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './data-availability-dashboard.component.html',
  styleUrls: ['./data-availability-dashboard.component.css']
})
export class DataAvailabilityDashboardComponent implements OnInit {
  
  // Data properties
  report: DataAvailabilityReport | null = null;
  
  // Filter properties
  startDate: string = '';
  endDate: string = '';
  
  // UI State
  activeTab: string = 'overview';
  loading: boolean = false;
  error: string = '';
  
  // Chart configurations
  timeSeriesChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  timeSeriesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  locationCoverageChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  satelliteAvailabilityChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  
  qualityScoreChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  constructor(
    private reportService: DataAvailabilityReportService,
    private exportService: ExportService
  ) {
    // Set default dates (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.endDate = now.toISOString().slice(0, 16);
    this.startDate = weekAgo.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.loadReport();
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Data loading
  async loadReport(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      this.reportService.getDataAvailabilityReport(this.startDate, this.endDate)
        .subscribe({
          next: (report) => {
            this.report = report;
            this.updateCharts();
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load data availability report: ' + error.message;
            this.loading = false;
          }
        });
      
    } catch (error) {
      this.error = 'Failed to load data availability report: ' + (error as Error).message;
      this.loading = false;
    }
  }

  // Chart updates
  private updateCharts(): void {
    if (!this.report) return;
    
    this.updateTimeSeriesChart();
    this.updateLocationCoverageChart();
    this.updateSatelliteAvailabilityChart();
    this.updateQualityScoreChart();
  }
  
  private updateTimeSeriesChart(): void {
    const flow = this.report!.timeSeriesFlow;
    
    this.timeSeriesChartData = {
      labels: flow.timeLabels,
      datasets: [
        {
          label: 'Records per Hour',
          data: flow.recordsPerHour,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }
      ]
    };
  }
  
  private updateLocationCoverageChart(): void {
    const locations = this.report!.locationCoverage;
    
    this.locationCoverageChartData = {
      labels: locations.map(l => l.locationName),
      datasets: [
        {
          label: 'Completeness %',
          data: locations.map(l => l.completenessPercentage),
          backgroundColor: locations.map(l => this.getCompletenessColor(l.completenessPercentage))
        }
      ]
    };
  }
  
  private updateSatelliteAvailabilityChart(): void {
    const satellites = this.report!.satelliteAvailability;
    
    this.satelliteAvailabilityChartData = {
      labels: satellites.map(s => s.satelliteSystem),
      datasets: [{
        data: satellites.map(s => s.totalRecords),
        backgroundColor: [
          '#10B981', // Green
          '#3B82F6', // Blue
          '#F59E0B', // Amber
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#06B6D4'  // Cyan
        ]
      }]
    };
  }
  
  private updateQualityScoreChart(): void {
    const quality = this.report!.qualitySummary;
    
    this.qualityScoreChartData = {
      labels: Object.keys(quality.locationQualityScores),
      datasets: [
        {
          label: 'Quality Score %',
          data: Object.values(quality.locationQualityScores),
          backgroundColor: Object.values(quality.locationQualityScores)
            .map(score => this.getQualityColor(score))
        }
      ]
    };
  }

  // Helper methods
  private getCompletenessColor(percentage: number): string {
    if (percentage >= 90) return '#10B981'; // Green
    if (percentage >= 75) return '#F59E0B'; // Amber
    if (percentage >= 50) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  }
  
  private getQualityColor(score: number): string {
    if (score >= 95) return '#10B981'; // Green
    if (score >= 85) return '#3B82F6'; // Blue
    if (score >= 70) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  }
  
  getHealthStatusClass(status: string): string {
    switch (status) {
      case 'GOOD': case 'EXCELLENT': case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'MODERATE': case 'INTERMITTENT':
        return 'text-yellow-600 bg-yellow-100';
      case 'POOR': case 'INACTIVE':
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
  
  formatDuration(ms: number): string {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return Math.round(ms/1000) + 's';
    return Math.round(ms/60000) + 'm';
  }

  // Export functions
  exportReport(): void {
    if (!this.report) return;
    
    const data = {
      reportGenerated: this.report.reportGenerated,
      reportPeriod: this.report.reportPeriod,
      overallSummary: this.report.overallSummary,
      locationCoverage: this.report.locationCoverage,
      satelliteAvailability: this.report.satelliteAvailability
    };
    
    this.exportService.exportAsJSON([data], `data_availability_report_${new Date().getTime()}.json`);
  }
  
  exportFileUploads(): void {
    if (!this.report?.fileUploads) return;
    this.exportService.exportAsCSV(this.report.fileUploads, `file_uploads_${new Date().getTime()}.csv`);
  }
  
  exportDataGaps(): void {
    if (!this.report?.dataGaps.missingPeriods) return;
    this.exportService.exportAsCSV(this.report.dataGaps.missingPeriods, `data_gaps_${new Date().getTime()}.csv`);
  }
}

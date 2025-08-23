import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DataService } from '../../services/data.service';
import { ExportService } from '../../services/export.service';

interface DataAvailabilityMatrix {
  locations: string[];
  referenceSystems: string[];
  timePeriods: string[];
  satellites: string[];
  matrix: { [location: string]: { [refSys: string]: { [time: string]: CellData } } };
  startDate: string;
  endDate: string;
  timeUnit: string;
  summary: StatisticsSummary;
}

interface CellData {
  hasData: boolean;
  recordCount: number;
  satellites: string[];
  satelliteCount: { [satellite: string]: number };
  satelliteData?: { [satellite: string]: number }; // Individual satellite record counts for matrix display
  completeness: number;
  avgRefSysDiff: number;
  firstRecord: string;
  lastRecord: string;
  status: string;
}

interface StatisticsSummary {
  totalRecords: number;
  uniqueLocations: number;
  uniqueSatellites: number;
  totalTimePeriods: number;
  overallCompleteness: number;
  dataRangeStart: string;
  dataRangeEnd: string;
}

interface LocationStats {
  location: string;
  displayName: string;
  totalRecords: number;
  firstData: string;
  lastData: string;
  satellites: string[];
  satelliteCount: { [satellite: string]: number };
  completeness: number;
  missingData: number;
  status: string;
  avgRefSysDiff: number;
  refSysStats: { [refSys: string]: number };
}

interface SatelliteCoverage {
  satelliteSystem: string;
  satelliteLetter: string;
  totalRecords: number;
  locations: string[];
  coveragePercentage: number;
  avgSignalQuality: number;
  firstSeen: string;
  lastSeen: string;
  healthStatus: string;
  locationCounts: { [location: string]: number };
}

interface TimeTrends {
  timeLabels: string[];
  totalRecords: number[];
  avgRefSysDiff: number[];
  uniqueLocations: number[];
  uniqueSatellites: number[];
  satelliteTrends: { [satellite: string]: number[] };
  locationTrends: { [location: string]: number[] };
  groupBy: string;
}

interface DataQuality {
  overallScore: number;
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  missingRecords: number;
  averageAccuracy: number;
  standardDeviation: number;
  qualityByLocation: { [location: string]: number };
  errorTypes: string[];
  recommendations: string[];
}

@Component({
  selector: 'app-advanced-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './advanced-statistics.component.html',
  styleUrls: ['./advanced-statistics.component.css']
})
export class AdvancedStatisticsComponent implements OnInit {
  
  // Data properties
  matrixData: DataAvailabilityMatrix | null = null;
  locationStats: LocationStats[] = [];
  satelliteStats: SatelliteCoverage[] = [];
  timeTrends: TimeTrends | null = null;
  dataQuality: DataQuality | null = null;
  
  // Filter properties
  startDate: string = '';
  endDate: string = '';
  selectedLocations: string[] = [];
  selectedSatellites: string[] = [];
  timeUnit: string = 'DAY';
  
  // UI State
  activeTab: string = 'matrix';
  loading: boolean = false;
  error: string = '';
  
  // Available options
  availableLocations: string[] = ['Bangalore', 'Faridabad', 'DRC', 'Ahmedabad', 'Bhubaneshwar', 'Guwahati'];
  availableSatellites: string[] = ['G', 'E', 'R', 'C', 'NAVIC'];
  timeUnits: string[] = ['HOUR', 'DAY', 'WEEK', 'MONTH'];
  
  // Chart configurations
  trendsChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  trendsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  completenessChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
    }]
  };
  
  satelliteChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  constructor(
    private dataService: DataService,
    private exportService: ExportService
  ) {
    // Set default dates (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.endDate = now.toISOString().slice(0, 16);
    this.startDate = weekAgo.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.loadMatrixData();
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    switch(tab) {
      case 'matrix':
        if (!this.matrixData) this.loadMatrixData();
        break;
      case 'locations':
        if (this.locationStats.length === 0) this.loadLocationStats();
        break;
      case 'satellites':
        if (this.satelliteStats.length === 0) this.loadSatelliteStats();
        break;
      case 'trends':
        if (!this.timeTrends) this.loadTimeTrends();
        break;
      case 'quality':
        if (!this.dataQuality) this.loadDataQuality();
        break;
    }
  }

  // Data loading methods
  async loadMatrixData(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      const params = new URLSearchParams({
        startDate: this.startDate,
        endDate: this.endDate,
        timeUnit: this.timeUnit
      });
      
      if (this.selectedLocations.length > 0) {
        this.selectedLocations.forEach(loc => params.append('locations', loc));
      }
      
      if (this.selectedSatellites.length > 0) {
        this.selectedSatellites.forEach(sat => params.append('satellites', sat));
      }
      
      const response = await fetch(`http://localhost:6003/time-traceability-service/api/statistics/data-availability-matrix?${params}`);
      if (!response.ok) throw new Error('Failed to load matrix data');
      
      this.matrixData = await response.json();
      this.updateCompletenessChart();
      
    } catch (error) {
      this.error = 'Failed to load matrix data: ' + (error as Error).message;
    } finally {
      this.loading = false;
    }
  }

  async loadLocationStats(): Promise<void> {
    this.loading = true;
    try {
      const params = new URLSearchParams({
        startDate: this.startDate,
        endDate: this.endDate
      });
      
      const response = await fetch(`http://localhost:6003/time-traceability-service/api/statistics/location-summary?${params}`);
      if (!response.ok) throw new Error('Failed to load location stats');
      
      this.locationStats = await response.json();
      
    } catch (error) {
      this.error = 'Failed to load location statistics: ' + (error as Error).message;
    } finally {
      this.loading = false;
    }
  }

  async loadSatelliteStats(): Promise<void> {
    this.loading = true;
    try {
      const params = new URLSearchParams({
        startDate: this.startDate,
        endDate: this.endDate
      });
      
      const response = await fetch(`http://localhost:6003/time-traceability-service/api/statistics/satellite-coverage?${params}`);
      if (!response.ok) throw new Error('Failed to load satellite stats');
      
      this.satelliteStats = await response.json();
      this.updateSatelliteChart();
      
    } catch (error) {
      this.error = 'Failed to load satellite statistics: ' + (error as Error).message;
    } finally {
      this.loading = false;
    }
  }

  async loadTimeTrends(): Promise<void> {
    this.loading = true;
    try {
      const params = new URLSearchParams({
        startDate: this.startDate,
        endDate: this.endDate,
        groupBy: this.timeUnit
      });
      
      const response = await fetch(`http://localhost:6003/time-traceability-service/api/statistics/time-trends?${params}`);
      if (!response.ok) throw new Error('Failed to load time trends');
      
      this.timeTrends = await response.json();
      this.updateTrendsChart();
      
    } catch (error) {
      this.error = 'Failed to load time trends: ' + (error as Error).message;
    } finally {
      this.loading = false;
    }
  }

  async loadDataQuality(): Promise<void> {
    this.loading = true;
    try {
      const params = new URLSearchParams({
        startDate: this.startDate,
        endDate: this.endDate
      });
      
            const response = await fetch(`http://localhost:6003/time-traceability-service/api/statistics/data-quality?${params}`);
      if (!response.ok) throw new Error('Failed to load data quality');
      
      this.dataQuality = await response.json();
      
    } catch (error) {
      this.error = 'Failed to load data quality: ' + (error as Error).message;
    } finally {
      this.loading = false;
    }
  }

  // Chart update methods
  private updateCompletenessChart(): void {
    if (!this.matrixData) return;
    
    const summary = this.matrixData.summary;
    const complete = summary.overallCompleteness;
    const partial = Math.max(0, 100 - complete - 10); // Assuming 10% missing
    const missing = Math.max(0, 100 - complete - partial);
    
    this.completenessChartData = {
      labels: ['Complete', 'Partial', 'Missing'],
      datasets: [{
        data: [complete, partial, missing],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
      }]
    };
  }

  private updateTrendsChart(): void {
    if (!this.timeTrends) return;
    
    this.trendsChartData = {
      labels: this.timeTrends.timeLabels,
      datasets: [
        {
          label: 'Total Records',
          data: this.timeTrends.totalRecords,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Unique Locations',
          data: this.timeTrends.uniqueLocations,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1'
        }
      ]
    };

    this.trendsChartOptions = {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    };
  }

  private updateSatelliteChart(): void {
    if (this.satelliteStats.length === 0) return;
    
    this.satelliteChartData = {
      labels: this.satelliteStats.map(s => s.satelliteSystem),
      datasets: [{
        label: 'Total Records',
        data: this.satelliteStats.map(s => s.totalRecords),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
        ]
      }]
    };
  }

  // Matrix visualization helper methods
  getSatelliteBoxClass(satellite: string): string {
    const satLower = satellite.toLowerCase();
    if (satLower.includes('g') || satLower.includes('gps')) {
      return 'satellite-box gps';
    } else if (satLower.includes('navic') || satLower.includes('n')) {
      return 'satellite-box navic';
    } else if (satLower.includes('e') || satLower.includes('galileo')) {
      return 'satellite-box galileo';
    } else if (satLower.includes('r') || satLower.includes('glonass')) {
      return 'satellite-box glonass';
    } else if (satLower.includes('c') || satLower.includes('beidou')) {
      return 'satellite-box beidou';
    } else if (satLower.includes('q') || satLower.includes('qzss')) {
      return 'satellite-box qzss';
    } else {
      return 'satellite-box default';
    }
  }

  getEmptyBoxes(satelliteCount: number): number[] {
    const maxBoxes = 6; // Maximum boxes to show in a grid
    const emptyCount = Math.max(0, maxBoxes - satelliteCount);
    return Array.from({length: emptyCount}, (_, i) => i);
  }

  // Filter methods
  onLocationChange(location: string, event: any): void {
    if (event.target.checked) {
      this.selectedLocations.push(location);
    } else {
      this.selectedLocations = this.selectedLocations.filter(l => l !== location);
    }
  }

  onSatelliteChange(satellite: string, event: any): void {
    if (event.target.checked) {
      this.selectedSatellites.push(satellite);
    } else {
      this.selectedSatellites = this.selectedSatellites.filter(s => s !== satellite);
    }
  }

  applyFilters(): void {
    this.matrixData = null;
    this.locationStats = [];
    this.satelliteStats = [];
    this.timeTrends = null;
    this.dataQuality = null;
    
    switch(this.activeTab) {
      case 'matrix': this.loadMatrixData(); break;
      case 'locations': this.loadLocationStats(); break;
      case 'satellites': this.loadSatelliteStats(); break;
      case 'trends': this.loadTimeTrends(); break;
      case 'quality': this.loadDataQuality(); break;
    }
  }

  // Utility methods
  getCellStatus(cellData: CellData): string {
    if (!cellData.hasData) return 'bg-red-100 text-red-800';
    if (cellData.completeness >= 90) return 'bg-green-100 text-green-800';
    if (cellData.completeness >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getCellTooltip(cellData: CellData): string {
    if (!cellData.hasData) return 'No data available';
    return `Records: ${cellData.recordCount}\nSatellites: ${cellData.satellites.join(', ')}\nCompleteness: ${cellData.completeness.toFixed(1)}%`;
  }

  getStatusBadgeClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat().format(Math.round(num));
  }

  // Export methods
  exportMatrix(): void {
    if (!this.matrixData) return;
    
    const data = [];
    for (const location of this.matrixData.locations) {
      for (const refSys of this.matrixData.referenceSystems) {
        for (const time of this.matrixData.timePeriods) {
          const cellData = this.matrixData.matrix[location][refSys][time];
          data.push({
            Location: location,
            'Reference System': refSys,
            'Time Period': time,
            'Has Data': cellData.hasData,
            'Record Count': cellData.recordCount,
            'Satellites': cellData.satellites.join(', '),
            'Completeness': cellData.completeness,
            'Status': cellData.status
          });
        }
      }
    }
    
    this.exportService.exportAsCSV(data, 'data-availability-matrix');
  }

  exportLocationStats(): void {
    if (this.locationStats.length === 0) return;
    this.exportService.exportAsCSV(this.locationStats, 'location-statistics');
  }

  exportSatelliteStats(): void {
    if (this.satelliteStats.length === 0) return;
    this.exportService.exportAsCSV(this.satelliteStats, 'satellite-statistics');
  }
}

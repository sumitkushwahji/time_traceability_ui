import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FilterService } from '../../../services/filter.service';
import { SatDataService } from '../../../services/sat-data.service';

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.css'],
})
export class DataViewComponent implements OnInit {
  // 'all' for dashboard-like views (aggregated data), 'specific' for city-specific views.
  @Input() dataType: 'all' | 'specific' = 'all';
  @Input() dataIdentifier?: string; // e.g., city name if dataType is 'specific'

  startDate?: string;
  endDate?: string;
  selectedSource: string = '';
  pivotedData: any[] = [];
  filteredData: any[] = [];
  satelliteList: string[] = [];
  dropdownOpen: boolean = false;

  constructor(
    private satDataService: SatDataService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    // Subscribe to filter changes first
    this.filterService.filter$.subscribe((filterValue: string) => {
      this.applyFilter(filterValue);
    });
    
    // Then fetch data
    this.fetchPivotedData();
  }

  fetchPivotedData(): void {
    if (this.dataType === 'all') {
      // This is for the dashboard or any view needing aggregated data
      this.satDataService
        .getPivotedSatDataForPlot()
        .subscribe(
          (data) => {
            this.pivotedData = data;
            this.filteredData = data;
            this.satelliteList = this.extractUniqueSatellites(data);
            
            // Apply current filter state immediately after data loads
            const currentFilter = this.filterService.getCurrentFilter();
            this.applyFilter(currentFilter);
          },
          (err) => {
            console.error('Error fetching aggregated pivoted data:', err);
          }
        );
    } else if (this.dataType === 'specific' && this.dataIdentifier) {
      // This will be for city-specific pages, using the plot service method to get all satellite types
      this.satDataService
        .getPivotedSatDataForPlot(this.dataIdentifier, this.startDate, this.endDate)
        .subscribe(
          (data) => {
            this.pivotedData = data;
            this.filteredData = data;
            this.satelliteList = this.extractUniqueSatellites(data);
            
            // Apply current filter state immediately after data loads
            const currentFilter = this.filterService.getCurrentFilter();
            this.applyFilter(currentFilter);
          },
          (err) => {
            console.error(`Error fetching specific pivoted data for ${this.dataIdentifier}:`, err);
          }
        );
    } else {
      console.warn('DataViewComponent: dataType or dataIdentifier not properly set. Defaulting to "all".');
      // Fallback to 'all' data if inputs are not set correctly for 'specific' type
      this.dataType = 'all';
      this.fetchPivotedData();
    }
  }

  applyFilter(filter: string): void {
    if (filter === 'ALL') {
      this.filteredData = this.pivotedData;
    } else if (filter === 'GPS') {
      // Filter for GPS satellites (exact match for 'GPS' system name)
      this.filteredData = this.pivotedData.filter(
        (row) => row.satLetter?.toUpperCase() === 'GPS'
      );
    } else if (filter === 'NAVIC') {
      // Filter for NavIC satellites (exact match for 'NAVIC' system name)
      this.filteredData = this.pivotedData.filter(
        (row) => row.satLetter?.toUpperCase() === 'NAVIC'
      );
    } else if (filter === 'GLONASS') {
      // Filter for GLONASS satellites (exact match for 'GLONASS' system name)
      this.filteredData = this.pivotedData.filter(
        (row) => row.satLetter?.toUpperCase() === 'GLONASS'
      );
    } else {
      // Fallback to exact satellite letter match
      this.filteredData = this.pivotedData.filter(
        (row) => row.satLetter?.toUpperCase() === filter
      );
    }
    
    // Update satellite list based on filtered data and current filter
    this.updateSatelliteListForFilter(filter);
  }

  updateSatelliteListForFilter(filter: string): void {
    // Get all satellites from the original data
    const allSatellites = this.extractUniqueSatellites(this.pivotedData);
    
    if (filter === 'ALL') {
      this.satelliteList = allSatellites;
    } else if (filter === 'GPS') {
      // Show only GPS satellites (those starting with 'G')
      this.satelliteList = allSatellites.filter(sat => sat.toUpperCase().startsWith('G'));
    } else if (filter === 'NAVIC') {
      // Show only NavIC satellites (those starting with 'IR')
      this.satelliteList = allSatellites.filter(sat => sat.toUpperCase().startsWith('IR'));
    } else if (filter === 'GLONASS') {
      // Show only GLONASS satellites (those starting with 'R')
      this.satelliteList = allSatellites.filter(sat => sat.toUpperCase().startsWith('R'));
    } else {
      // For specific satellite filtering, show all satellites but could be refined
      this.satelliteList = allSatellites;
    }
  }

  extractUniqueSatellites(data: any[]): string[] {
    const set = new Set<string>();
    data.forEach((row) => {
      if (row.locationDiffs) {
        Object.keys(row.locationDiffs).forEach((key) => {
          set.add(key);
        });
      }
    });
    return Array.from(set).sort();
  }

  export(format: string): void {
    this.dropdownOpen = false;

    switch (format) {
      case 'csv':
        this.exportCSV();
        break;
      case 'json':
        this.exportJSON();
        break;
      case 'txt':
        this.exportTXT();
        break;
      case 'sql':
        this.exportSQL();
        break;
      default:
        console.warn('Unknown export format:', format);
    }
  }

  private exportCSV(): void {
    console.log('Export CSV triggered');
    // TODO: implement CSV export logic here
  }

  private exportJSON(): void {
    // Round numeric values to 2 decimal places before JSON export
    const roundedData = this.roundNumericValues(this.filteredData);
    const jsonStr = JSON.stringify(roundedData, null, 2);
    this.downloadFile(jsonStr, 'data.json', 'application/json');
  }

  private exportTXT(): void {
    console.log('Export TXT triggered');
  }

  private exportSQL(): void {
    console.log('Export SQL triggered');
  }

  // Helper method to round numeric values to 2 decimal places
  private roundNumericValues(data: any[]): any[] {
    return data.map(row => {
      const roundedRow: any = {};
      Object.keys(row).forEach(key => {
        let value = (row as any)[key];
        
        // Round numeric values to 2 decimal places
        if (typeof value === 'number' && !isNaN(value)) {
          value = Number(value.toFixed(2));
        }
        
        roundedRow[key] = value;
      });
      return roundedRow;
    });
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}

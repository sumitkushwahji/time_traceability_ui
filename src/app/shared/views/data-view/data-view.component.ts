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
    this.fetchPivotedData();

    this.filterService.filter$.subscribe((filterValue: string) => {
      this.applyFilter(filterValue);
    });
  }

  fetchPivotedData(): void {
    if (this.dataType === 'all') {
      // This is for the dashboard or any view needing aggregated data
      this.satDataService
        .getPivotedSatData(this.startDate, this.endDate, this.selectedSource)
        .subscribe(
          (data) => {
            this.pivotedData = data;
            this.filteredData = data;
            this.satelliteList = this.extractUniqueSatellites(data);
          },
          (err) => {
            console.error('Error fetching aggregated pivoted data:', err);
          }
        );
    } else if (this.dataType === 'specific' && this.dataIdentifier) {
      // This will be for city-specific pages, using the new service method
      this.satDataService
        .getPivotedSatDataByIdentifier(this.dataIdentifier, this.startDate, this.endDate, this.selectedSource)
        .subscribe(
          (data) => {
            this.pivotedData = data;
            this.filteredData = data;
            this.satelliteList = this.extractUniqueSatellites(data);
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
    } else {
      this.filteredData = this.pivotedData.filter(
        (row) => row.satLetter?.toUpperCase() === filter
      );
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
    const jsonStr = JSON.stringify(this.filteredData, null, 2);
    this.downloadFile(jsonStr, 'data.json', 'application/json');
  }

  private exportTXT(): void {
    console.log('Export TXT triggered');
  }

  private exportSQL(): void {
    console.log('Export SQL triggered');
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

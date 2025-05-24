import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SatDataService } from '../../../../services/sat-data.service';

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.css'],
})
export class DataViewComponent implements OnInit {
  startDate?: string;
  endDate?: string;
  selectedSource: string = '';
  pivotedData: any[] = [];
  satelliteList: string[] = [];
  dropdownOpen: boolean = false;  // controls export dropdown visibility

  constructor(private satDataService: SatDataService) {}

  ngOnInit(): void {
    this.fetchPivotedData();
  }

  fetchPivotedData(): void {
    this.satDataService.getPivotedSatData(this.startDate, this.endDate, this.selectedSource).subscribe(
      (data) => {
        console.log(data);
        this.pivotedData = data;
        this.satelliteList = this.extractUniqueSatellites(data);
      },
      (err) => {
        console.error('Error fetching pivoted data:', err);
      }
    );
  }

  extractUniqueSatellites(data: any[]): string[] {
    const set = new Set<string>();
    data.forEach(row => {
      if (row.locationDiffs) {
        Object.keys(row.locationDiffs).forEach(key => {
          set.add(key);
        });
      }
    });
    return Array.from(set).sort();
  }

  export(format: string): void {
    this.dropdownOpen = false; // close dropdown on export click

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
    // TODO: implement CSV export logic here
    console.log('Export CSV triggered');
  }

  private exportJSON(): void {
    // Simple JSON export example
    const jsonStr = JSON.stringify(this.pivotedData, null, 2);
    this.downloadFile(jsonStr, 'data.json', 'application/json');
  }

  private exportTXT(): void {
    // TODO: implement TXT export logic here (e.g., tab separated values)
    console.log('Export TXT triggered');
  }

  private exportSQL(): void {
    // TODO: implement SQL export logic here
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

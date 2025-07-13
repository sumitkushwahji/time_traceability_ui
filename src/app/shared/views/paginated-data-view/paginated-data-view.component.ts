import { Component, OnInit, Input } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { DateRangeService } from '../../../services/date-range.service';
import { ExportService } from '../../../services/export.service';
import { SatData, SatDataService } from '../../../services/sat-data.service';

@Component({
  selector: 'app-paginated-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paginated-data-view.component.html',
  styleUrl: './paginated-data-view.component.css',
})
export class PaginatedDataViewComponent implements OnInit {
  @Input() dataIdentifier?: string; // Input for city-specific data (e.g., 'bangalore')

  private searchSubject = new Subject<string>();
  data: SatData[] = []; // This will hold the paginated data
  totalItems = 0;
  dropdownOpen = false;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  sortColumn = 'id';
  sortDirection = 'asc';

  private _searchQuery = '';
  get searchQuery(): string {
    return this._searchQuery;
  }
  set searchQuery(value: string) {
    this._searchQuery = value;
    this.searchSubject.next(value);
  }

  startDate: string = '';
  endDate: string = '';

  constructor(
    private satDataService: SatDataService,
    private exportService: ExportService,
    private dataService: DataService,
    private dateRangeService: DateRangeService
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.getData();
    });
    this.getData();

    this.dateRangeService.dateRange$.subscribe((range) => {
      this.startDate = range.start;
      this.endDate = range.end;
      this.currentPage = 1; // Reset page on date change
      this.getData();
    });
  }

  getData(): void {
    const backendPage = this.currentPage - 1;

    if (this.dataIdentifier) {
      // Fetch paginated data for a specific identifier (e.g., city)
      this.satDataService
        .getPaginatedSatDataByIdentifier( // Corrected method name
          this.dataIdentifier,
          backendPage,
          this.pageSize,
          this.sortColumn,
          this.sortDirection,
          this.searchQuery,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response: { content: SatData[]; totalElements: number }) => { // Explicit type
            this.data = response.content;
            this.totalItems = response.totalElements;
            this.dataService.setData(this.data);
          },
          (error: any) => { // Explicit type
            console.error(`Error fetching paginated data for ${this.dataIdentifier}:`, error);
          }
        );
    } else {
      // Fallback or default behavior if no identifier is provided
      this.satDataService
        .getSatData(
          backendPage,
          this.pageSize,
          this.sortColumn,
          this.sortDirection,
          this.searchQuery,
          this.startDate,
          this.endDate
        )
        .subscribe(
          (response: { content: SatData[]; totalElements: number }) => { // Explicit type
            this.data = response.content;
            this.totalItems = response.totalElements;
            this.dataService.setData(this.data);
          },
          (error: any) => { // Explicit type
            console.error('Error fetching general paginated data:', error);
          }
        );
    }
  }

  setSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.getData();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalItems) {
      this.currentPage++;
      this.getData();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getData();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.getData();
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.getData();
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    const end = this.startIndex + this.data.length;
    return end > this.totalItems ? this.totalItems : end;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  export(format: string): void {
    this.dropdownOpen = false;
    const fileName = `data.${format}`;
    const tableName = 'sat_data';

    this.exportService.exportTable(
      this.data,
      format as 'csv' | 'json' | 'txt' | 'sql',
      fileName,
      tableName
    );
  }
}

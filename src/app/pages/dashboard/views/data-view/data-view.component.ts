import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { ExportService } from '../../../../services/export.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SatData, SatDataService } from '../../../../services/sat-data.service';
import { DataService } from '../../../../services/data.service';
import { DateRangeService } from '../../../../services/date-range.service';

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.css',
})
export class DataViewComponent implements OnInit {
  private searchSubject = new Subject<string>();
  location = 'dashboard';
  data: SatData[] = [];
  data2: any[] = [];
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

    this.data2 = this.mockData();

    this.dateRangeService.dateRange$.subscribe((range) => {
      this.startDate = range.start;
      this.endDate = range.end;
      this.getData();
    });
  }

  mockData(): any[] {
    const now = new Date();
    return Array.from({ length: 50 }).map((_, i) => ({
      mjdDateTime: new Date(now.getTime() + i * 60000),
      avgRefsysDifference: Math.random() * 10 + 5,
    }));
  }

  getData(): void {
    const backendPage = this.currentPage - 1;

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
      .subscribe((response) => {
        this.data = response.content;
        this.totalItems = response.totalElements;
        this.dataService.setData(this.data); // update shared service with fresh data
      });
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
    const fileName = `dashboard_data.${format}`;
    const tableName = 'sat_data';

    this.exportService.exportTable(
      this.data,
      format as 'csv' | 'json' | 'txt' | 'sql',
      fileName,
      tableName
    );

    this.dropdownOpen = false;
  }
}

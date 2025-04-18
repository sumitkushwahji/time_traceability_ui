import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { ExportService } from '../../services/export.service';

export interface SatData {
  id: string;
  satLetter: string;
  mjd: number;
  sttime: string;
  mjdDateTime: string;
  source1: string;
  source2: string;
  avg1: number;
  avg2: number;
  avgRefsysDifference: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TopButtonsComponent,
    RightPanelComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private searchSubject = new Subject<string>();
  location = 'dashboard';
  data: SatData[] = [];
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

  constructor(private http: HttpClient, private exportService: ExportService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.getData();
    });
    this.getData();
  }

  getData(): void {
    const backendPage = this.currentPage - 1;
    let params = new HttpParams()
      .set('page', backendPage.toString())
      .set('size', this.pageSize.toString())
      .set('sortBy', this.sortColumn)
      .set('sortDir', this.sortDirection)
      .set('search', this.searchQuery.trim());

    // Convert startDate and endDate to UTC before sending to the backend
    if (this.startDate) {
      this.startDate = this.convertToUTC(this.startDate);
      params = params.set('startDate', this.startDate);
    }
    if (this.endDate) {
      this.endDate = this.convertToUTC(this.endDate);
      params = params.set('endDate', this.endDate);
    }

    this.http
      .get<any>('http://localhost:8082/api/data/sat-differences', { params })
      .subscribe((response) => {
        this.data = response.content;
        this.totalItems = response.totalElements;
      });
  }

  // Convert the date to UTC
  convertToUTC(dateString: string): string {
    const localDate = new Date(dateString);
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
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
    const tableName = 'sat_data'; // only used for SQL

    this.exportService.exportTable(
      this.data,
      format as 'csv' | 'json' | 'txt' | 'sql',
      fileName,
      tableName
    );

    this.dropdownOpen = false;
  }
}

// src/app/shared/views/paginated-data-view/paginated-data-view.component.ts

import { Component, OnInit, Input } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { DateRangeService } from '../../../services/date-range.service';
import { ExportService } from '../../../services/export.service';
import { SatData, SatDataService } from '../../../services/sat-data.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-paginated-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paginated-data-view.component.html',
  styleUrl: './paginated-data-view.component.css',
})
export class PaginatedDataViewComponent implements OnInit {
  @Input() dataIdentifier?: string; // This will receive 'bangalore'

  private searchSubject = new Subject<string>();
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
  selectedFilter: string = 'ALL';

  // Mapping from identifier to source2 codes
  private readonly locationSource2Map: { [key: string]: string[] } = {
    npl: ['GZLI2P', 'IRNPLI'],
    bangalore: ['GZLMB1', 'GZLMB2', 'IRLMB2', 'IRLMB1'],
    faridabad: ['GZLMF1', 'GZLMF2', 'IRACCO'],
    ahmedabad: ['GZLAHM1', 'IRAHM1'],
    bhubaneshwar: ['GZLBBS1', 'IRBBS1'],
    drc: ['GZLDEL1', 'IRDEL1'],
    guwahati: ['GZLGHT1', 'IRGHT1'],
  };

  constructor(
    private satDataService: SatDataService,
    private exportService: ExportService,
    private dataService: DataService,
    private dateRangeService: DateRangeService,
    private route: ActivatedRoute,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.filterService.filter$.subscribe((filter) => {
      this.selectedFilter = filter;
      this.currentPage = 1;
      this.getData();
    });

    // ✅ Extract dataIdentifier from route data
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.getData();
    });
    this.getData();

    this.dateRangeService.dateRange$.subscribe((range) => {
      this.startDate = range.start;
      this.endDate = range.end;
      this.currentPage = 1;
      this.getData();
    });
  }

  getData(): void {
    const backendPage = this.currentPage - 1;

    // Determine the source2 code based on dataIdentifier
    const source2 = this.dataIdentifier
      ? this.locationSource2Map[this.dataIdentifier]?.[1] ?? ''
      : '';

    // If a dataIdentifier is present, and no active user search,
    // the search parameter in the URL should be empty.
    // If there's a user search, that should take precedence.
    const effectiveSearchQuery = this.searchQuery.trim();

    const fetcher = source2 // If a specific source2 code is determined
      ? this.satDataService.getPaginatedSatDataBySource2(
          source2,
          backendPage,
          this.pageSize,
          this.sortColumn,
          this.sortDirection,
          effectiveSearchQuery,
          this.startDate,
          this.endDate,
          this.selectedFilter // ✅ NEW
        )
      : // Otherwise, call the general getSatData
        this.satDataService.getSatData(
          backendPage,
          this.pageSize,
          this.sortColumn,
          this.sortDirection,
          effectiveSearchQuery, // This will be '' if searchQuery is empty
          this.startDate,
          this.endDate
        );

    fetcher.subscribe(
      (response: { content: SatData[]; totalElements: number }) => {
        this.data = response.content;
        this.totalItems = response.totalElements;
        this.dataService.setData(this.data);
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
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
      format as any,
      fileName,
      tableName
    );
  }
}

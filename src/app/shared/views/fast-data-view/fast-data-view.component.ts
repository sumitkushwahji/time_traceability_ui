import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { SatDataService } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';
import { ExportService } from '../../../services/export.service';
import { locationSource2Map } from '../../location-source2.map';

interface SatData {
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
  // New fields from the combined materialized view
  weightedAvg1: number;
  weightedAvg2: number;
  weightedAvgDifference: number;
}

@Component({
  selector: 'app-fast-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fast-data-view.component.html',
  styleUrls: ['./fast-data-view.component.css'],
})
export class FastDataViewComponent implements OnInit, OnDestroy {
  // --- STATE MANAGEMENT ---
  Math = Math;
  displayedData: SatData[] = [];
  totalItems = 0;
  loading = false;
  dataIdentifier?: string;

  // --- PAGINATION & SORTING ---
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  sortColumn = 'mjd_date_time';
  sortDirection = 'desc';

  // --- FILTERING ---
  selectedFilter = 'NAVIC';
  startDate = '';
  endDate = '';
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // --- UI ---
  dropdownOpen = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private satDataService: SatDataService,
    private filterService: FilterService,
    private dateRangeService: DateRangeService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];
    
    // Handle filter changes. This subscription also handles the initial data load.
    this.filterService.filter$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(filter => {
      const filterChanged = this.selectedFilter !== filter;
      this.selectedFilter = filter;
      if (filterChanged) {
        this.currentPage = 1;
      }
      this.loadData();
    });

    // Handle date range changes, but skip the initial value from the service.
    this.dateRangeService.dateRange$.pipe(
      skip(1), // Ignore the first emission
      takeUntil(this.destroy$)
    ).subscribe(range => {
      this.startDate = range.start;
      this.endDate = range.end;
      this.currentPage = 1;
      this.loadData();
    });

    // Add debouncing to the search input to avoid excessive API calls
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
        this.currentPage = 1;
        this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    
    const apiSortColumn = this.sortColumn === 'mjdDateTime' ? 'mjd_date_time' : this.sortColumn;

    const source2Codes = this.dataIdentifier
      ? locationSource2Map[this.dataIdentifier]
      : Object.values(locationSource2Map).flat();

    this.satDataService.getOptimizedSatData(
      source2Codes,
      this.currentPage - 1, // API is 0-indexed
      this.pageSize,
      apiSortColumn,
      this.sortDirection,
      this.startDate,
      this.endDate,
      this.selectedFilter !== 'ALL' ? this.selectedFilter : null
    ).subscribe({
      next: (response) => {
        // FIX: Cast the response content to the local SatData interface to resolve type mismatch.
        this.displayedData = response.content as SatData[];
        this.totalItems = response.totalElements;
        this.loading = false;
        console.log(`✅ Loaded page ${this.currentPage} with ${this.displayedData.length} records.`);
      },
      error: (error) => {
        console.error('❌ Error loading optimized data:', error);
        this.displayedData = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  // --- EVENT HANDLERS ---
  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  setSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.loadData();
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadData();
  }

  nextPage(): void {
    if ((this.currentPage * this.pageSize) < this.totalItems) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  // --- UTILITY & EXPORT ---
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    const end = this.startIndex + this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  export(format: string): void {
    console.warn(`Exporting only the current page of data.`);
    const fileName = `${this.dataIdentifier || 'data'}_export_page_${this.currentPage}.${format}`;
    
    this.exportService.exportTable(
      this.displayedData,
      format as 'csv' | 'json' | 'txt' | 'sql',
      fileName,
      'sat_data'
    );
    this.dropdownOpen = false;
  }
}


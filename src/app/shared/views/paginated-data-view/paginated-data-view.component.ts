// src/app/shared/views/paginated-data-view/paginated-data-view.component.ts

import { Component, OnInit, Input, OnDestroy } from '@angular/core'; // 🎯 Added OnDestroy
import { Subject, Observable, combineLatest } from 'rxjs'; // 🎯 Added combineLatest
import { debounceTime, distinctUntilChanged, startWith, tap, takeUntil } from 'rxjs/operators'; // 🎯 Added operators

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
  styleUrls: ['./paginated-data-view.component.css'], // 🎯 Corrected styleUrl to styleUrls
})
export class PaginatedDataViewComponent implements OnInit, OnDestroy { // 🎯 Implemented OnDestroy
  @Input() dataIdentifier?: string;

  // 🎯 Use Subjects for parameters that can change from UI interactions
  private searchInput$ = new Subject<string>(); // For debounced search input
  private filterChange$ = new Subject<string>(); // For external filter service changes
  private dateRangeChange$ = new Subject<{ start: string; end: string }>(); // For external date range service changes AND internal date input changes
  private pageChange$ = new Subject<void>(); // For page navigation (next/previous/pageSize change)
  private sortChange$ = new Subject<void>(); // For sort column/direction changes

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
    if (this._searchQuery !== value) { // Prevent unnecessary emits if value is same
      this._searchQuery = value;
      this.searchInput$.next(value); // Emit to the search subject
    }
  }

  startDate: string = '';
  endDate: string = '';
  selectedFilter: string = 'ALL'; // This holds 'ALL', 'GPS', 'NAVIC', etc.

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

  private destroy$ = new Subject<void>(); // 🎯 For managing subscriptions lifecycle

  constructor(
    private satDataService: SatDataService,
    private exportService: ExportService,
    private dataService: DataService,
    private dateRangeService: DateRangeService,
    private route: ActivatedRoute,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    // 1. Initialize component properties from route data/services
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];

    // 2. Subscribe to external service changes and map them to internal subjects
    this.filterService.filter$
      .pipe(
        distinctUntilChanged(), // Only emit if filter actually changed
        tap((filter) => {
          this.selectedFilter = filter;
          this.currentPage = 1; // Reset page on filter change
        }),
        debounceTime(0), // Allow component state to update before triggering combined stream
        takeUntil(this.destroy$) // Ensure this subscription is cleaned up
      )
      .subscribe(() => this.filterChange$.next(this.selectedFilter)); // Emit to internal subject

    this.dateRangeService.dateRange$
      .pipe(
        distinctUntilChanged((prev, curr) => prev.start === curr.start && prev.end === curr.end),
        tap((range) => {
          this.startDate = range.start;
          this.endDate = range.end;
          this.currentPage = 1; // Reset page on date range change
        }),
        debounceTime(0), // Allow component state to update
        takeUntil(this.destroy$) // Ensure this subscription is cleaned up
      )
      .subscribe((range) => this.dateRangeChange$.next(range)); // Emit to internal subject


    // 3. Combine all relevant streams that trigger data fetching
    // Use startWith() on each to trigger an initial data fetch when component loads
    combineLatest([
      this.searchInput$.pipe(debounceTime(300), distinctUntilChanged(), startWith(this.searchQuery)),
      this.filterChange$.pipe(startWith(this.selectedFilter)), // Initial emit with component's initial filter
      this.dateRangeChange$.pipe(startWith({start: this.startDate, end: this.endDate})), // Initial emit with component's initial dates
      this.pageChange$.pipe(startWith(null)), // Initial emit for page (value doesn't matter, just trigger)
      this.sortChange$.pipe(startWith(null)) // Initial emit for sort (value doesn't matter, just trigger)
    ])
    .pipe(
        tap(() => console.log('Triggering getData call...')), // For debugging: see when getData is triggered
        debounceTime(50), // Small debounce to aggregate rapid changes (e.g., if multiple params init quickly)
        // distinctUntilChanged is tricky with objects/arrays. For simple values it's fine.
        // If you need deep comparison for the combined output, you'd need a custom comparator or JSON.stringify.
        // For now, let's rely on individual distinctUntilChanged and the debounce.
        // distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        tap(() => this.getData()), // Call getData once after all parameters have settled
        takeUntil(this.destroy$) // Unsubscribe from this combined observable when component is destroyed
    )
    .subscribe();

    // 🎯 REMOVED: The direct this.getData() call here, as combineLatest handles the initial fetch.
    // this.getData();
  }

  // 🎯 Implement OnDestroy to clean up subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal completion
    this.destroy$.complete(); // Complete the subject
  }

  getData(): void {
    const backendPage = this.currentPage - 1;

    // Determine the source2 codes based on dataIdentifier
    const source2Codes: string[] | null = this.dataIdentifier
      ? this.locationSource2Map[this.dataIdentifier] ?? null
      : null;

    // Determine the effective satLetter to send to the backend
    // Handle system-level filtering (GPS, NavIC, GLONASS) differently
    let effectiveSatLetter: string | null = null;
    
    if (this.selectedFilter === 'ALL') {
      effectiveSatLetter = null; // Show all satellites
    } else if (this.selectedFilter === 'GPS') {
      // For GPS filtering, we'll need to filter client-side since backend expects specific satLetter
      effectiveSatLetter = null; // Let all data come through, filter client-side later
    } else if (this.selectedFilter === 'NAVIC') {
      // For NavIC filtering, we'll need to filter client-side since backend expects specific satLetter
      effectiveSatLetter = null; // Let all data come through, filter client-side later
    } else if (this.selectedFilter === 'GLONASS') {
      // For GLONASS filtering, we'll need to filter client-side since backend expects specific satLetter
      effectiveSatLetter = null; // Let all data come through, filter client-side later
    } else {
      // For specific satellite letter filtering
      effectiveSatLetter = this.selectedFilter.trim();
    }

    const effectiveSearchQuery = this.searchQuery.trim();

    let fetcher: Observable<{ content: SatData[]; totalElements: number }>;

    // Use the specific service method if source2Codes are determined
    if (source2Codes) {
      fetcher = this.satDataService.getPaginatedSatDataBySource2(
        source2Codes, // Pass the array directly
        backendPage,
        this.pageSize,
        this.sortColumn,
        this.sortDirection,
        effectiveSearchQuery,
        this.startDate,
        this.endDate,
        effectiveSatLetter
      );
    } else {
      // Otherwise, call the general getSatData
      fetcher = this.satDataService.getSatData(
        backendPage,
        this.pageSize,
        this.sortColumn,
        this.sortDirection,
        effectiveSearchQuery,
        this.startDate,
        this.endDate,
        effectiveSatLetter
      );
    }

    fetcher.subscribe(
      (response: { content: SatData[]; totalElements: number }) => {
        let filteredData = response.content;
        
        // Apply client-side filtering for system-level filters
        if (this.selectedFilter === 'GPS') {
          filteredData = response.content.filter(
            (row) => row.satLetter?.toUpperCase().startsWith('G')
          );
        } else if (this.selectedFilter === 'NAVIC') {
          filteredData = response.content.filter(
            (row) => row.satLetter?.toUpperCase().startsWith('IR')
          );
        } else if (this.selectedFilter === 'GLONASS') {
          filteredData = response.content.filter(
            (row) => row.satLetter?.toUpperCase().startsWith('R')
          );
        }
        
        this.data = filteredData;
        this.totalItems = filteredData.length; // Update total count for system-level filtering
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
    this.sortChange$.next(); // 🎯 Trigger fetch via subject
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalItems) {
      this.currentPage++;
      this.pageChange$.next(); // 🎯 Trigger fetch via subject
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChange$.next(); // 🎯 Trigger fetch via subject
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset page on size change
    this.pageChange$.next(); // 🎯 Trigger fetch via subject (pageSize is part of component state)
  }

  // 🎯 Re-added and renamed for clarity: Method called by HTML date inputs
  onDateInputChange(): void {
    this.currentPage = 1; // Reset page when date changes
    // Emit the current startDate and endDate to the internal dateRangeChange$ subject
    this.dateRangeChange$.next({ start: this.startDate, end: this.endDate });
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
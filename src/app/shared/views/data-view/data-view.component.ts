import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SatDataService, PivotedDataResponse } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';

interface SatPivotedData {
  id: string;
  satLetter: string;
  mjd: number;
  mjdDateTime: string;
  sttime: string;
  // Updated type to explicitly allow for undefined values, resolving the warning.
  locationDiffs: { [key: string]: number | undefined };
}

@Component({
  selector: 'app-data-view', // Changed selector for consistency if needed
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-view.component.html', // Corrected template URL
  styleUrls: ['./data-view.component.css'],   // Corrected style URL
})
export class DataViewComponent implements OnInit, OnDestroy { // Renamed class
  private destroy$ = new Subject<void>();
  Math = Math;

  // Data State
  pivotedData: SatPivotedData[] = [];
  dynamicColumns: string[] = [];
  
  // Pagination State
  totalItems = 0;
  currentPage = 1;
  pageSize = 15;

  // Filtering State
  selectedFilter = 'ALL';
  startDate: string;
  endDate: string;

  // UI State
  isLoading = false;

  constructor(
    private satDataService: SatDataService,
    private filterService: FilterService,
    private dateRangeService: DateRangeService
  ) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.endDate = this.formatDateForInput(now);
    this.startDate = this.formatDateForInput(yesterday);
  }

  ngOnInit(): void {
    // Set the initial date range to trigger the first load
    this.dateRangeService.setDateRange(
      new Date(this.startDate).toISOString(),
      new Date(this.endDate).toISOString()
    );
    this.setupDataPipeline();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataPipeline(): void {
    combineLatest([
      this.filterService.filter$,
      this.dateRangeService.dateRange$
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([filter, dateRange]) => {
        this.isLoading = true;
        this.selectedFilter = filter;
        this.currentPage = 1; // Reset to first page on any filter change
        
        return this.fetchData(0, this.pageSize, dateRange.start, dateRange.end, filter);
      })
    ).subscribe(response => this.handleDataResponse(response));
  }
  
  private fetchData(page: number, size: number, startDate: string, endDate: string, filter: string) {
      return this.satDataService.getPivotedSatData2(page, size, startDate, endDate, filter)
        .pipe(catchError(() => {
            console.error("Failed to fetch pivoted data.");
            return of({ content: [], totalElements: 0 });
        }));
  }

  private handleDataResponse(response: PivotedDataResponse): void {
      this.pivotedData = response.content;
      this.totalItems = response.totalElements;
      this.extractDynamicColumns();
      this.isLoading = false;
  }

  private extractDynamicColumns(): void {
    const columnSet = new Set<string>();
    this.pivotedData.forEach(row => {
      Object.keys(row.locationDiffs).forEach(key => columnSet.add(key));
    });
    this.dynamicColumns = Array.from(columnSet).sort();
  }

  // --- Event Handlers ---
  onDateRangeChange(): void {
    this.dateRangeService.setDateRange(
      new Date(this.startDate).toISOString(),
      new Date(this.endDate).toISOString()
    );
  }

  onPageChange(newPage: number): void {
      if (newPage < 1 || newPage > this.totalPages || newPage === this.currentPage) return;
      
      this.currentPage = newPage;
      this.isLoading = true;
      
      // Fixed: Use the component's current date properties
      this.fetchData(
          this.currentPage - 1, 
          this.pageSize, 
          new Date(this.startDate).toISOString(), 
          new Date(this.endDate).toISOString(), 
          this.selectedFilter
      ).subscribe(response => this.handleDataResponse(response));
  }
  
  // --- Getters ---
  get totalPages(): number {
    return this.totalItems > 0 ? Math.ceil(this.totalItems / this.pageSize) : 1;
  }

  private formatDateForInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
  }
}


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
}

@Component({
  selector: 'app-fast-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fast-data-view.component.html',
  styleUrls: ['./fast-data-view.component.css'],
})
export class FastDataViewComponent implements OnInit, OnDestroy {
  // Math object for template access
  Math = Math;
  
  // Raw data from API (cached)
  allData: SatData[] = [];
  
  // Filtered and displayed data
  filteredData: SatData[] = [];
  displayedData: SatData[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalItems = 0;
  
  // Sorting
  sortColumn = 'mjd';
  sortDirection = 'desc';
  
  // Filtering and search
  selectedFilter = 'NAVIC'; // Default to NAVIC instead of ALL
  searchQuery = '';
  startDate = '';
  endDate = '';
  
  // UI state
  dropdownOpen = false;
  loading = false;
  
  // Location configuration
  dataIdentifier?: string;
  
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
    
    // Subscribe to filter changes
    this.filterService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter) => {
        this.selectedFilter = filter;
        this.applyFilters();
      });
    
    // Subscribe to date range changes
    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((range) => {
        this.startDate = range.start;
        this.endDate = range.end;
        this.loadData(); // Reload data when date range changes
      });
    
    // Initial data load
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    
    const source2Codes = this.dataIdentifier 
      ? locationSource2Map[this.dataIdentifier] ?? null 
      : null;

    if (source2Codes) {
      // 🚀 Use new optimized bulk endpoint for location-specific data
      this.satDataService.getBulkLocationData(
        source2Codes,
        this.startDate,
        this.endDate
      ).subscribe({
        next: (response) => {
          this.allData = response.data;
          console.log(`✅ Loaded ${this.allData.length} records from optimized bulk endpoint (cached: ${response.cached})`);
          
          // Debug: Log unique satellite letters
          const uniqueSatLetters = [...new Set(this.allData.map(item => item.satLetter))];
          console.log('Unique satellite letters available:', uniqueSatLetters);
          
          // Debug: Count by satellite system
          const navicCount = this.allData.filter(item => item.satLetter?.toUpperCase() === 'NAVIC').length;
          const gpsCount = this.allData.filter(item => item.satLetter?.toUpperCase() === 'GPS').length;
          const glonassCount = this.allData.filter(item => item.satLetter?.toUpperCase() === 'GLONASS').length;
          
          console.log('Satellite counts - NAVIC:', navicCount, 'GPS:', gpsCount, 'GLONASS:', glonassCount);
          
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading bulk data, falling back to optimized paginated:', error);
          this.loadDataFallback();
        }
      });
    } else {
      // For non-location specific data (home page), use optimized bulk endpoint with ALL locations
      this.loadDataFallback();
    }
  }

  private loadDataFallback(): void {
  // 🚀 PERFORMANCE OPTIMIZATION: For home page, use the same optimized bulk endpoint with ALL locations
  // Dynamically generate allSource2Values from locationSource2Map
  const allSource2Values = Object.values(locationSource2Map).flat();
    

    console.log('🏠 Loading home page data for data view with optimized bulk endpoint...');
    const startTime = performance.now();

    this.satDataService.getBulkLocationData(allSource2Values, this.startDate, this.endDate).subscribe({
      next: (response: { data: SatData[]; totalElements: number; cached: boolean }) => {
        const endTime = performance.now();
        const loadTime = (endTime - startTime).toFixed(2);
        
        console.log(`🏠 Home page data view loaded ${response.data.length} total records in ${loadTime}ms (cached: ${response.cached})`);
        this.allData = response.data;
        
        // Debug: Performance comparison info
        console.log(`⚡ Data view performance: ${loadTime}ms vs previous method`);
        
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading optimized home page data, using legacy fallback:', error);
        this.loadDataLegacyFallback();
      }
    });
  }

  private loadDataLegacyFallback(): void {
    // Legacy fallback method - only use if the optimized method fails
    console.log('⚠️  Using legacy data view fallback method...');
    
    const pageSize = 1000; // Large page size to get most data
    
    this.satDataService.getSatData(
      0, // page 0
      pageSize,
      'mjd',
      'asc',
      '', // no search filter at API level
      this.startDate,
      this.endDate,
      null // no satLetter filter at API level
    ).subscribe({
      next: (response) => {
        this.allData = response.content;
        console.log(`⚠️  Legacy fallback loaded ${this.allData.length} records`);
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Legacy fallback also failed:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allData];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.id?.toLowerCase().includes(query) ||
        item.satLetter?.toLowerCase().includes(query) ||
        item.mjdDateTime?.toLowerCase().includes(query) ||
        item.source1?.toLowerCase().includes(query) ||
        item.source2?.toLowerCase().includes(query)
      );
    }
    
    // Apply satellite system filter
    if (this.selectedFilter === 'GPS') {
      filtered = filtered.filter(item => item.satLetter?.toUpperCase() === 'GPS');
    } else if (this.selectedFilter === 'NAVIC') {
      // NAVIC satellites are labeled exactly as 'NAVIC' in the database
      filtered = filtered.filter(item => item.satLetter?.toUpperCase() === 'NAVIC');
      
      // Debug logging to understand NAVIC data
      console.log('NAVIC Filter Applied:');
      console.log('Total items before filter:', this.allData.length);
      console.log('Items after NAVIC filter:', filtered.length);
      if (filtered.length > 0) {
        const uniqueSatLetters = [...new Set(filtered.map(item => item.satLetter))];
        console.log('NAVIC satellite letters found:', uniqueSatLetters);
      } else {
        const allSatLetters = [...new Set(this.allData.map(item => item.satLetter))];
        console.log('All available satellite letters:', allSatLetters);
      }
    } else if (this.selectedFilter === 'GLONASS') {
      filtered = filtered.filter(item => item.satLetter?.toUpperCase() === 'GLONASS');
    }
    
    this.filteredData = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset to first page
    this.applySortingAndPagination();
  }

  applySortingAndPagination(): void {
    let sorted = [...this.filteredData];
    
    // Apply sorting
    sorted.sort((a, b) => {
      const aValue = a[this.sortColumn as keyof SatData];
      const bValue = b[this.sortColumn as keyof SatData];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = sorted.slice(startIndex, endIndex);
  }

  // Event handlers
  onSearchChange(): void {
    this.applyFilters();
  }

  setSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySortingAndPagination();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalItems) {
      this.currentPage++;
      this.applySortingAndPagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applySortingAndPagination();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applySortingAndPagination();
  }

  // Utility getters
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    const end = this.startIndex + this.displayedData.length;
    return end > this.totalItems ? this.totalItems : end;
  }

  // Export functionality
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  export(format: string): void {
    const fileName = `${this.dataIdentifier || 'data'}_export.${format}`;
    const tableName = 'sat_data';

    this.exportService.exportTable(
      this.filteredData,
      format as 'csv' | 'json' | 'txt' | 'sql',
      fileName,
      tableName
    );

    this.dropdownOpen = false;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SatDataService } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';

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
  selector: 'app-fast-plot-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './fast-plot-view.component.html',
  styleUrls: ['./fast-plot-view.component.css'],
})
export class FastPlotViewComponent implements OnInit, OnDestroy {
  // Raw data from API (cached)
  allData: SatData[] = [];
  
  // Filtered data for charts
  filteredData: SatData[] = [];
  
  // Chart configuration
  chartData: any;
  chartOptions: any;
  
  // Data display limits - default to all data to show complete dataset
  dataLimit = -1;
  dataLimits = [25, 50, 100, 200, -1]; // -1 means all data
  
  // Filtering
  selectedFilter = 'ALL';
  startDate = '';
  endDate = '';
  
  // UI state
  loading = false;
  
  // Component lifecycle
  private destroy$ = new Subject<void>();
  
  // Route parameters
  dataIdentifier?: string;
  
  // Location configuration (same as FastDataViewComponent)
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
    private filterService: FilterService,
    private dateRangeService: DateRangeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    
    // Get dataIdentifier from route data (same as FastDataViewComponent)
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];

    // Subscribe to filter changes
    this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: string) => {
      this.selectedFilter = filter;
      this.applyFilters();
      this.updateChartData();
    });

    // Subscribe to date range changes
    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((range) => {
        this.startDate = range.start;
        this.endDate = range.end;
        this.loadData(); // Reload data when date range changes
      });
    
    // Load initial data
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    
    const source2Codes = this.dataIdentifier 
      ? this.locationSource2Map[this.dataIdentifier] ?? null 
      : null;

    if (source2Codes) {
      // 🚀 Use new optimized bulk endpoint for location-specific data (same as FastDataViewComponent)
      this.satDataService.getBulkLocationData(
        source2Codes,
        this.startDate,
        this.endDate
      ).subscribe({
        next: (response: { data: SatData[]; totalElements: number; cached: boolean }) => {
          console.log(`🔄 Loaded ${response.data.length} total records for plot view (cached: ${response.cached})`);
          this.allData = response.data;
          
          // Debug: Log unique satellite letters
          const uniqueSatLetters = [...new Set(this.allData.map(item => item.satLetter))];
          console.log('Plot view - Unique satellite letters available:', uniqueSatLetters);
          
          // Debug: Count by satellite system
          const navicCount = this.allData.filter(item => item.satLetter?.toUpperCase() === 'NAVIC').length;
          const gpsCount = this.allData.filter(item => item.satLetter?.toUpperCase() === 'GPS').length;
          const glonassCount = this.allData.filter(item => item.satLetter?.toUpperCase() === 'GLONASS').length;
          
          console.log(`Plot view - Satellite counts - NAVIC: ${navicCount}, GPS: ${gpsCount}, GLONASS: ${glonassCount}`);
          
          this.applyFilters();
          this.updateChartData();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('❌ Error loading location-specific data for plot:', error);
          this.loadDataFallback();
        }
      });
    } else {
      // For non-location specific data (home page), use fallback
      this.loadDataFallback();
    }
  }

  private loadDataFallback(): void {
    // 🚀 PERFORMANCE OPTIMIZATION: For home page, use the same optimized bulk endpoint with ALL locations
    // but load data more efficiently
    const allSource2Values = [
      'GZLMB1', 'GZLMB2', 'IRLMB1', 'IRLMB2', // Bangalore
      'GZLMF1', 'GZLMF2', 'IRACCO', // Faridabad
      'GZLAHM1', 'IRAHM1', // Ahmedabad
      'GZLBBS1', 'IRBBS1', // Bhubaneshwar
      'GZLDEL1', 'IRDEL1', // DRC
      'GZLGHT1', 'IRGHT1', // Guwahati
      'GZLI2P', 'IRNPLI' // NPL
    ];

    console.log('🏠 Loading home page data with optimized bulk endpoint...');
    const startTime = performance.now();

    this.satDataService.getBulkLocationData(allSource2Values, this.startDate, this.endDate).subscribe({
      next: (response: { data: SatData[]; totalElements: number; cached: boolean }) => {
        const endTime = performance.now();
        const loadTime = (endTime - startTime).toFixed(2);
        
        console.log(`🏠 Home page loaded ${response.data.length} total records in ${loadTime}ms (cached: ${response.cached})`);
        this.allData = response.data;
        
        // Debug: Performance comparison info
        console.log(`⚡ Performance: ${loadTime}ms vs previous method`);
        
        this.applyFilters();
        this.updateChartData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading optimized home page data:', error);
        console.log('🔄 Falling back to individual location requests...');
        this.loadDataLegacyFallback();
      }
    });
  }

  private loadDataLegacyFallback(): void {
    // Legacy fallback method - only use if the optimized method fails
    console.log('⚠️  Using legacy fallback method...');
    
    // Could implement a fallback using the old getSatData method if needed
    this.loading = false;
    console.error('Unable to load data - please check backend connection');
  }

  private applyFilters(): void {
    let filtered = [...this.allData];

    console.log(`📊 Starting with ${filtered.length} total records`);

    // Apply satellite filter
    if (this.selectedFilter && this.selectedFilter !== 'ALL') {
      const beforeCount = filtered.length;
      // Fixed NAVIC filtering - exact match instead of startsWith
      if (this.selectedFilter === 'NAVIC') {
        filtered = filtered.filter(item => item.satLetter === 'NAVIC');
      } else {
        filtered = filtered.filter(item => item.satLetter === this.selectedFilter);
      }
      console.log(`🛰️  Satellite filter (${this.selectedFilter}): ${beforeCount} → ${filtered.length} records`);
    }

    // Apply date range filter
    if (this.startDate && this.endDate) {
      const beforeCount = filtered.length;
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.mjdDateTime).getTime();
        return itemDate >= start && itemDate <= end;
      });
      console.log(`📅 Date filter: ${beforeCount} → ${filtered.length} records`);
    }

    // Note: Location filtering is already done at the API level using source2Codes
    // No need for additional location filtering here

    // Debug: Show unique satellite letters in filtered data
    const uniqueSatLetters = [...new Set(filtered.map(item => item.satLetter))];
    console.log('🛰️  Unique satellite letters available:', uniqueSatLetters);

    // Debug: Show unique source2 values in filtered data
    const uniqueSource2 = [...new Set(filtered.map(item => item.source2))];
    console.log('📍 Unique source2 values available:', uniqueSource2);

    // Debug: Count by satellite type
    const satelliteCounts = uniqueSatLetters.map(satLetter => ({
      satLetter,
      count: filtered.filter(item => item.satLetter === satLetter).length
    }));
    console.log('📊 Satellite counts:', satelliteCounts);

    this.filteredData = filtered;
  }

  private updateChartData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      console.log('⚠️  No data available for chart');
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    // Sort by time for proper plot ordering
    const sortedData = [...this.filteredData].sort((a, b) => 
      new Date(a.mjdDateTime).getTime() - new Date(b.mjdDateTime).getTime()
    );

    // Apply data limit - take last N points to show latest data on right side
    const sliced = this.dataLimit === -1 ? sortedData : sortedData.slice(-this.dataLimit);

    console.log(`📈 Preparing chart with ${sliced.length} data points (limit: ${this.dataLimit}, showing latest data)`);

    // Group by source2 for plotting separate lines per location
    const source2Groups: { [key: string]: SatData[] } = {};
    sliced.forEach(item => {
      if (!source2Groups[item.source2]) {
        source2Groups[item.source2] = [];
      }
      source2Groups[item.source2].push(item);
    });

    console.log('📊 Plot data grouped by source2:', Object.keys(source2Groups));
    console.log('📊 Data counts per source2:', Object.keys(source2Groups).map(key => ({
      source2: key,
      count: source2Groups[key].length,
      satellites: [...new Set(source2Groups[key].map(item => item.satLetter))]
    })));

    // Create labels using IST datetime format like Link Stability
    this.chartData = {
      labels: sliced.map(d => new Date(d.mjdDateTime).toLocaleString()), // Using IST datetime format
      datasets: Object.keys(source2Groups).map(source2 => {
        const source2Data = source2Groups[source2];
        const color = this.getColorForSource2(source2);
        
        // Create data array aligned with labels
        const dataPoints = sliced.map(labelItem => {
          const matchingPoint = source2Data.find(dataItem => 
            dataItem.sttime === labelItem.sttime && 
            dataItem.mjd === labelItem.mjd &&
            dataItem.source2 === source2
          );
          return matchingPoint ? matchingPoint.avgRefsysDifference : null;
        });

        console.log(`📈 Dataset for ${source2}: ${dataPoints.filter(p => p !== null).length} non-null points`);

        return {
          label: source2,
          data: dataPoints,
          borderColor: color,
          backgroundColor: color + '20', // Add transparency
          pointBorderColor: color,
          pointBackgroundColor: color,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.3,
          spanGaps: true, // Connect points even if some are null
        };
      })
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          display: true,
        },
        title: {
          display: true,
          text: `${this.dataIdentifier ? this.dataIdentifier.charAt(0).toUpperCase() + this.dataIdentifier.slice(1) : 'Location'} RefSys Differences by Source2${this.selectedFilter !== 'ALL' ? ` (${this.selectedFilter})` : ''}`,
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            title: (context: any) => {
              return `Time: ${context[0].label}`;
            },
            label: (context: any) => {
              const value = context.raw;
              if (value === null) return '';
              return `${context.dataset.label}: ${Number(value).toFixed(6)}`;
            }
          }
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time (Indian Standard Time)',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'RefSys Diff',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
    };

    console.log(`✅ Chart updated with ${this.chartData.datasets.length} datasets`);
  }

  private getColorForSource2(source2: string): string {
    // Assign consistent colors based on source2 location codes
    const colorMap: { [key: string]: string } = {
      // Original location mappings
      'BLR': '#3B82F6', // Blue for Bangalore
      'FAR': '#EF4444', // Red for Faridabad
      'GUW': '#10B981', // Green for Guwahati
      'BHU': '#F59E0B', // Amber for Bhubaneshwar
      'DRC': '#8B5CF6', // Purple for DRC
      'AHM': '#EC4899', // Pink for Ahmedabad
      
      // Bangalore location codes
      'GZLMB1': '#3B82F6', // Blue for GZLMB1
      'GZLMB2': '#1E40AF', // Darker blue for GZLMB2
      'IRLMB1': '#1E40AF', // Light blue for IRLMB1
      'IRLMB2': '#DBEAFE', // Very light blue for IRLMB2
      
      // Faridabad location codes
      'GZLMF1': '#EF4444', // Red for GZLMF1
      'GZLMF2': '#DC2626', // Darker red for GZLMF2
      'IRACCO': '#FCA5A5', // Light red for IRACCO
      
      // Ahmedabad location codes
      'GZLAHM1': '#EC4899', // Pink for GZLAHM1
      'IRAHM1': '#F472B6', // Light pink for IRAHM1
      
      // Bhubaneshwar location codes
      'GZLBBS1': '#F59E0B', // Amber for GZLBBS1
      'IRBBS1': '#FBBF24', // Light amber for IRBBS1
      
      // DRC location codes
      'GZLDEL1': '#8B5CF6', // Purple for GZLDEL1
      'IRDEL1': '#A78BFA', // Light purple for IRDEL1
      
      // Guwahati location codes
      'GZLGHT1': '#10B981', // Green for GZLGHT1
      'IRGHT1': '#34D399', // Light green for IRGHT1
      
      // NPL location codes
      'GZLI2P': '#6B7280', // Gray for GZLI2P
      'IRNPLI': '#9CA3AF', // Light gray for IRNPLI
    };

    if (colorMap[source2]) {
      return colorMap[source2];
    }

    // Generate consistent color based on source2 name for unknown codes
    let hash = 0;
    for (let i = 0; i < source2.length; i++) {
      hash = source2.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  onDataLimitChange(): void {
    console.log(`📊 Data limit changed to: ${this.dataLimit}`);
    this.updateChartData();
  }

  getStatistics(field: 'avg1' | 'avg2' | 'avgRefsysDifference'): { min: number; max: number; avg: number } {
    if (this.filteredData.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const values = this.filteredData.map(item => item[field]).filter(val => !isNaN(val));
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    return { min, max, avg };
  }
}

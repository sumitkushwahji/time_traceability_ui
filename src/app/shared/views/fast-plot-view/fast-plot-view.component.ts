import { Component, OnInit, OnDestroy } from '@angular/core';
import { getReceiverDisplayName } from '../../receiver-display-name.map';
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
  selectedFilter = 'NAVIC'; // Default to NAVIC instead of ALL
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
    ahmedabad: ['GZLAHM1', 'IRAHM1', 'GZLMA2'], // Added GZLMA2 for Ahmedabad data
    bhubaneshwar: ['GZLBBS1', 'IRBBS1'],
    drc: ['GZLDEL1', 'IRDEL1'],
    guwahati: ['GZLGHT1', 'IRGHT1'],
  };

  // Location name to abbreviation mapping for plot titles
  private readonly locationAbbreviationMap: { [key: string]: string } = {
    npl: 'NPL',
    bangalore: 'BLR',
    faridabad: 'FBD', 
    ahmedabad: 'AMD',
    bhubaneshwar: 'BBS',
    drc: 'DRC',
    guwahati: 'GHY',
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
      'GZLAHM1', 'IRAHM1', 'GZLMA2', // Ahmedabad (added GZLMA2)
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

    console.log(`📈 Plot View preparing chart with ${sliced.length} data points (limit: ${this.dataLimit}, showing ${this.dataLimit === -1 ? 'ALL' : 'LAST ' + this.dataLimit} data)`);

    // Debug: Log time range of displayed data
    if (sliced.length > 0) {
      const firstTime = new Date(sliced[0].mjdDateTime).toISOString();
      const lastTime = new Date(sliced[sliced.length - 1].mjdDateTime).toISOString();
      console.log(`⏰ Plot View time range: ${firstTime} to ${lastTime}`);
    }

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
          label: getReceiverDisplayName(source2),
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
          text: this.getPlotTitle(),
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
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
              return `${context.dataset.label}: ${Number(value).toFixed(2)}`;
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
            text: 'Time Difference (ns)',
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
    // 🎨 CONSISTENT COLOR SCHEME: Same color order for all locations
    // This ensures first dataset in each location gets the same color, 
    // second dataset gets the same second color, etc.
    
    // First, determine which position this source2 is in for the current location
    const currentLocationSources = this.dataIdentifier 
      ? this.locationSource2Map[this.dataIdentifier] ?? []
      : [];
    
    // Find the index of this source2 in the current location's source list
    const sourceIndex = currentLocationSources.indexOf(source2);
    
    // Define consistent colors for positions (1st, 2nd, 3rd, etc. data series)
    const consistentColors = [
      '#3B82F6', // Blue - First data series in all locations
      '#EF4444', // Red - Second data series in all locations  
      '#10B981', // Green - Third data series in all locations
      '#F59E0B', // Amber - Fourth data series in all locations
      '#8B5CF6', // Purple - Fifth data series in all locations
      '#EC4899', // Pink - Sixth data series in all locations
      '#6B7280', // Gray - Seventh data series in all locations
      '#14B8A6', // Teal - Eighth data series in all locations
      '#F97316', // Orange - Ninth data series in all locations
      '#06B6D4', // Sky Blue - Tenth data series in all locations
      '#84CC16', // Lime - Eleventh data series in all locations
      '#A855F7', // Violet - Twelfth data series in all locations
      '#E11D48', // Rose - Thirteenth data series in all locations
      '#0891B2', // Cyan - Fourteenth data series in all locations
      '#65A30D', // Green-600 - Fifteenth data series in all locations
    ];
    
    // If we found the source in the current location's list, use position-based color
    if (sourceIndex !== -1 && sourceIndex < consistentColors.length) {
      console.log(`🎨 Assigning color for ${source2} at position ${sourceIndex}: ${consistentColors[sourceIndex]}`);
      return consistentColors[sourceIndex];
    }
    
    // Fallback: Generate consistent color based on source2 name for unknown codes
    let hash = 0;
    for (let i = 0; i < source2.length; i++) {
      hash = source2.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    console.log(`⚠️  Using generated color for unknown source: ${source2} - hsl(${hue}, 70%, 50%)`);
    return `hsl(${hue}, 70%, 50%)`;
  }

  private getPlotTitle(): string {
    if (!this.dataIdentifier) {
      return 'Common-View Time Transfer Performance';
    }

    // Get location abbreviation for title
    const locationAbbr = this.locationAbbreviationMap[this.dataIdentifier] || this.dataIdentifier.toUpperCase();
    const locationName = this.dataIdentifier.charAt(0).toUpperCase() + this.dataIdentifier.slice(1);
    
    return `Common-View Time Transfer Performance between NPLI and ${locationName} (${locationAbbr})`;
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

    return { 
      min: Number(min.toFixed(2)), 
      max: Number(max.toFixed(2)), 
      avg: Number(avg.toFixed(2)) 
    };
  }
}

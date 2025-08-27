import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { SatDataService } from '../../../services/sat-data.service';
import { getReceiverDisplayName } from '../../receiver-display-name.map';
import { FilterService } from '../../../services/filter.service';

// Use same interface as Plot View for identical data processing
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

// Use same interface as Plot View for consistent data handling
interface SatData2 {
  satLetter: string;
  mjd: number;
  mjdDateTime: string;
  sttime: string;
  locationDiffs: {
    [location: string]: number;
  };
}

@Component({
  selector: 'app-link-stability',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './link-stability.component.html',
  styleUrls: ['./link-stability.component.css'],
})
export class LinkStabilityComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Use same data structure as Plot View for consistent CV Diff calculations
  rawData: SatData[] = [];
  filteredData: SatData[] = [];
  
  // Chart configurations
  plotChartData: any;
  tdevChartData: ChartConfiguration["data"] | null = null;
  
  // Chart options
  plotChartOptions: any;
  tdevChartOptions: any;
  
  // Data display limits - explicitly set to show ALL data by default (same as Plot View)
  dataLimit = -1; // Explicitly set to -1 to show all data
  dataLimits = [50, 100, 200, 500, -1]; // -1 means all data
  
  // Filtering
  selectedFilter = 'ALL';
  startDate = '';
  endDate = '';
  dataIdentifier = '';
  
  // UI state
  isLoading = false;
  error: string | null = null;
  
  // TDEV Analysis state
  showTdevAnalysis = false;

  // Platform check for SSR compatibility
  isBrowser = false;

  // Location to station mapping
  readonly locationStationMap: { [key: string]: string[] } = {
    npl: ['GZLI2P', 'IRNPLI'],
    bangalore: ['GZLMB1', 'GZLMB2', 'IRLMB2', 'IRLMB1'],
    faridabad: ['GZLMF1', 'GZLMF2', 'IRLMF1', 'IRLMF2'],
    ahmedabad: ['GZLAHM1', 'IRLMA1', 'GZLMA2'], // Added GZLMA2 for Ahmedabad data
    bhubaneshwar: ['GZLBBS1', 'IRLMO1', 'IRLMO2'],
    drc: ['GZLDEL1', 'IRDEL1'],
    guwahati: ['GZLGHT1', 'IRGHT1'],
  };

  // Location name to abbreviation mapping for plot titles
  readonly locationAbbreviationMap: { [key: string]: string } = {
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
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    // Get the data identifier from route data
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'] || '';
    
    console.log(`🔧 Link Stability ngOnInit: dataIdentifier="${this.dataIdentifier}", dataLimit=${this.dataLimit}`);
    
    // Update chart titles now that we have the data identifier
    this.updateChartTitles();
    
    // Subscribe to filter changes
    this.filterService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter: string) => {
        console.log(`🔄 Link Stability: Filter changed from "${this.selectedFilter}" to "${filter}"`);
        this.selectedFilter = filter;
        this.applyFilters();
      });

    // Subscribe to date range changes
    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ start, end }) => {
        console.log(`📅 Link Stability: Date range changed to ${start} - ${end}`);
        this.startDate = start;
        this.endDate = end;
        this.applyFilters();
      });

    // Load initial data
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeChartOptions(): void {
    // Initialize with basic options - title will be set dynamically later
    this.plotChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '', // Will be set dynamically
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (Indian Standard Time)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Time Difference (ns)',
          },
        },
      },
    };

    this.tdevChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '', // Will be set dynamically
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        x: {
          type: 'logarithmic',
          title: {
            display: true,
            text: 'Averaging Time τ (seconds)',
          },
          ticks: {
            callback: function (value: any) {
              return value.toString();
            },
          },
        },
        y: {
          type: 'logarithmic',
          title: {
            display: true,
            text: 'Time Deviation (ns)',
          },
          ticks: {
            callback: function (value: any) {
              return value.toString();
            },
          },
        },
      },
    };
  }

  private updateChartTitles(): void {
    if (!this.dataIdentifier) return;

    // Get location abbreviation for title
    const locationAbbr = this.locationAbbreviationMap[this.dataIdentifier] || this.dataIdentifier?.toUpperCase() || 'UNKNOWN';
    const locationName = this.dataIdentifier?.charAt(0).toUpperCase() + this.dataIdentifier?.slice(1);
    const plotTitle = `Common-View Time Transfer Performance between NPLI and ${locationName} (${locationAbbr})`;

    // Update plot chart title
    if (this.plotChartOptions?.plugins?.title) {
      this.plotChartOptions.plugins.title.text = plotTitle;
    }

    // Update TDEV chart title  
    if (this.tdevChartOptions?.plugins?.title) {
      this.tdevChartOptions.plugins.title.text = `Time Deviation Analysis - ${plotTitle}`;
    }
  }

  private loadData(): void {
    if (!this.dataIdentifier) {
      this.error = 'No data identifier provided';
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    console.log(`Loading data for location: ${this.dataIdentifier}, filter: ${this.selectedFilter}, dates: ${this.startDate} - ${this.endDate}`);

    // Use same location mapping as fast-plot-view for all locations
    const locationSource2Map: { [key: string]: string[] } = {
      npl: ['GZLI2P', 'IRNPLI'],
    bangalore: ['GZLMB1', 'GZLMB2', 'IRLMB2', 'IRLMB1'],
    faridabad: ['GZLMF1', 'GZLMF2', 'IRLMF1', 'IRLMF2'],
    ahmedabad: ['GZLAHM1', 'IRLMA1', 'GZLMA2'], // Added GZLMA2 for Ahmedabad data
    bhubaneshwar: ['GZLBBS1', 'IRLMO1', 'IRLMO2'],
    drc: ['GZLDEL1', 'IRDEL1'],
    guwahati: ['GZLGHT1', 'IRGHT1'],
    };
    
    const source2Codes = this.dataIdentifier 
      ? locationSource2Map[this.dataIdentifier] ?? null 
      : null;

    if (source2Codes) {
      // Use same API method as fast-plot-view for consistent data
      this.satDataService.getBulkLocationData(
        source2Codes,
        this.startDate,
        this.endDate
      ).subscribe({
        next: (response: { data: SatData[]; totalElements: number; cached: boolean }) => {
          console.log(`🔄 Loaded ${response.data.length} total records for link stability (cached: ${response.cached})`);
          this.rawData = response.data;
          
          // Debug: Log unique satellite letters
          const uniqueSatLetters = [...new Set(this.rawData.map(item => item.satLetter))];
          console.log('Link stability - Unique satellite letters available:', uniqueSatLetters);
          
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading bulk location data:', err);
          this.error = 'Failed to load data. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      console.error('No source2 codes found for location:', this.dataIdentifier);
      this.error = 'Invalid location identifier.';
      this.isLoading = false;
    }
  }





  private applyFilters(): void {
    if (!this.rawData) {
      this.filteredData = [];
      return;
    }

    console.log(`🔍 Link Stability: Applying filters to ${this.rawData.length} records with filter: "${this.selectedFilter}"`);
    
    // Use EXACTLY the same filtering logic as fast-plot-view
    let filtered = [...this.rawData];

    console.log(`� Starting with ${filtered.length} total records`);

    // Apply satellite filter using EXACT SAME LOGIC as Plot View
    if (this.selectedFilter && this.selectedFilter !== 'ALL') {
      const beforeCount = filtered.length;
      // Fixed NAVIC filtering - exact match instead of startsWith (SAME AS PLOT VIEW)
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

    // Debug: Show unique satellite letters in filtered data (SAME AS PLOT VIEW)
    const uniqueSatLetters = [...new Set(filtered.map(item => item.satLetter))];
    console.log('🛰️  Unique satellite letters available:', uniqueSatLetters);

    // Debug: Show unique source2 values in filtered data (SAME AS PLOT VIEW)
    const uniqueSource2 = [...new Set(filtered.map(item => item.source2))];
    console.log('📍 Unique source2 values available:', uniqueSource2);

    // Debug: Count by satellite type (SAME AS PLOT VIEW)
    const satelliteCounts = uniqueSatLetters.map(satLetter => ({
      satLetter,
      count: filtered.filter(item => item.satLetter === satLetter).length
    }));
    console.log('📊 Satellite counts:', satelliteCounts);

    // Store filtered data without applying data limit (same as Plot View)
    this.filteredData = filtered;
    console.log(`Final filtered data: ${this.filteredData.length} records`);
    this.updatePlotChart();
    
    // Reset TDEV analysis when data changes
    this.showTdevAnalysis = false;
    this.tdevChartData = null;
  }

  // Use the same filterLocationDiffsBySystem method as Plot View
  private filterLocationDiffsBySystem(locationDiffs: { [key: string]: number }, systemPrefix: string): { [key: string]: number } {
    const filtered: { [key: string]: number } = {};
    
    Object.keys(locationDiffs).forEach(satKey => {
      if (systemPrefix === 'IR') {
        // For NavIC, check if satellite starts with 'IR'
        if (satKey.toUpperCase().startsWith('IR')) {
          filtered[satKey] = locationDiffs[satKey];
        }
      } else {
        // For GPS ('G') and GLONASS ('R'), check first character
        if (satKey.toUpperCase().startsWith(systemPrefix)) {
          filtered[satKey] = locationDiffs[satKey];
        }
      }
    });
    
    return filtered;
  }

  // Filter data to show only stations relevant to the current location  
  private filterDataByLocation(data: SatData2[], location: string): SatData2[] {
    const locationStationCodes = this.locationStationMap[location.toLowerCase()] || [];
    
    if (locationStationCodes.length === 0) {
      console.warn(`No station codes found for location: ${location}`);
      return data;
    }
    
    console.log(`Filtering data for location ${location}, station codes:`, locationStationCodes);
    
    return data.map(record => {
      const filteredLocationDiffs: { [key: string]: number } = {};
      
      // Only include location diffs for the current location's station codes
      locationStationCodes.forEach(stationCode => {
        if (record.locationDiffs[stationCode] !== undefined) {
          filteredLocationDiffs[stationCode] = record.locationDiffs[stationCode];
        }
      });
      
      return {
        ...record,
        locationDiffs: filteredLocationDiffs
      };
    }).filter(record => Object.keys(record.locationDiffs).length > 0);
  }

  // Helper method to get average CV Diff from locationDiffs object (same as Plot View logic)
  private getAverageRefSysDiff(record: SatData2): number {
    const locationDiffs = record.locationDiffs;
    const values = Object.values(locationDiffs);
    
    if (values.length === 0) {
      return 0;
    }
    
    // Calculate average of all location differences for this record
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private updatePlotChart(): void {
    if (this.filteredData.length === 0) {
      this.plotChartData = null;
      return;
    }

    console.log(`📊 Link Stability updatePlotChart: filteredData.length=${this.filteredData.length}, dataLimit=${this.dataLimit}`);

    // Sort by time for proper plot ordering - SAME AS PLOT VIEW
    const sortedData = [...this.filteredData].sort((a, b) => 
      new Date(a.mjdDateTime).getTime() - new Date(b.mjdDateTime).getTime()
    );

    // Apply data limit exactly like Plot View does
    const sliced = this.dataLimit === -1 ? sortedData : sortedData.slice(-this.dataLimit);

    console.log(`📊 Link Stability sliced data: ${sliced.length} points (showing ${this.dataLimit === -1 ? 'ALL' : 'LAST ' + this.dataLimit})`);

    // Use same x-axis labeling as Plot View  
    const labels = sliced.map(d => new Date(d.mjdDateTime).toLocaleString());

    // Use same approach as Plot View to create multiple datasets - one per station
    const datasets = this.buildDatasets(sliced);

    this.plotChartData = {
      labels,
      datasets,
    };

    console.log(`📈 Plot chart updated with ${sliced.length} data points, ${datasets.length} station datasets for ${this.dataIdentifier} (limit: ${this.dataLimit})`);
    
    // Debug: Log time range of displayed data
    if (sliced.length > 0) {
      const firstTime = new Date(sliced[0].mjdDateTime).toISOString();
      const lastTime = new Date(sliced[sliced.length - 1].mjdDateTime).toISOString();
      console.log(`⏰ Link Stability time range: ${firstTime} to ${lastTime}`);
    }
  }

  // Build datasets method similar to Plot View for multiple station lines
  private buildDatasets(data: SatData[]) {
    if (!data || data.length === 0) {
      return [];
    }

    // Get all unique source2 values (stations) from the data - same as fast-plot-view
    const allStations = new Set<string>();
    data.forEach(d => {
      if (d.source2) {
        allStations.add(d.source2);
      }
    });

    // 🎨 CONSISTENT COLOR SCHEME: Use same position-based colors as fast-plot-view
    const getConsistentColorForStation = (station: string): string => {
      // First, determine which position this station is in for the current location
      const currentLocationSources = this.locationStationMap[this.dataIdentifier] ?? [];
      
      // Find the index of this station in the current location's source list
      const stationIndex = currentLocationSources.indexOf(station);
      
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
      
      // If we found the station in the current location's list, use position-based color
      if (stationIndex !== -1 && stationIndex < consistentColors.length) {
        console.log(`🎨 Link Stability: Assigning color for ${station} at position ${stationIndex}: ${consistentColors[stationIndex]}`);
        return consistentColors[stationIndex];
      }
      
      // Fallback: Generate consistent color based on station name for unknown codes
      return this.getRandomColor();
    };

    const datasets: any[] = [];

    Array.from(allStations).forEach(station => {
      // Filter data for this specific station - same approach as fast-plot-view
      const stationData = data.filter(d => d.source2 === station);
      
      // Create data points using avgRefsysDifference directly like Plot View
      const dataPoints = data.map(d => {
        const matchingPoint = stationData.find(sd => 
          sd.sttime === d.sttime && 
          sd.mjd === d.mjd &&
          sd.source2 === station
        );
        return matchingPoint ? matchingPoint.avgRefsysDifference : null;
      });

      const color = getConsistentColorForStation(station);

      datasets.push({
        label: `${getReceiverDisplayName(station)}`,
        data: dataPoints,
        borderColor: color,
        backgroundColor: 'transparent',
        pointBackgroundColor: dataPoints.map(point => {
          // Color coding for points: green for ±30ns, yellow for outside, red for >20ns
          if (point === null) return color;
          const diff = Math.abs(point);
          if (diff <= 30) return 'green';
          if (diff <= 50) return 'rgb(255, 205, 86)';
          return 'red';
        }),
        pointBorderColor: color,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      });
    });

    return datasets;
  }

  private getRandomColor(): string {
    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)', 
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onDataLimitChange(): void {
    this.applyFilters();
  }

  calculateTimeDeviation(): void {
    if (this.filteredData.length < 10) {
      this.error = 'Insufficient data points for TDEV analysis. Need at least 10 data points.';
      return;
    }

    this.error = null;
    this.isLoading = true;

    try {
      // Sort data by time first - same as Plot View and updatePlotChart
      const sortedData = [...this.filteredData].sort((a, b) => 
        new Date(a.mjdDateTime).getTime() - new Date(b.mjdDateTime).getTime()
      );
      
      // Use the same data slicing as the chart display
      const sliced = this.dataLimit === -1 ? sortedData : sortedData.slice(-this.dataLimit);
      
      console.log(`Calculating TDEV for location: ${this.dataIdentifier}`);
      console.log(`Using ${sliced.length} total data points (with limit: ${this.dataLimit})`);

      // Get all unique receivers/stations for this location - same as plot view
      const allStations = new Set<string>();
      sliced.forEach(d => {
        if (d.source2) {
          allStations.add(d.source2);
        }
      });

      const stationArray = Array.from(allStations);
      console.log(`Found ${stationArray.length} receivers: ${stationArray.join(', ')}`);

      // Calculate TDEV/MDEV for each receiver separately
      const allMdevData: { station: string; data: { tau: number; MDEV: number }[] }[] = [];
      const allTdevData: { station: string; data: { tau: number; TDEV: number }[] }[] = [];

      stationArray.forEach(station => {
        console.log(`\nCalculating TDEV for receiver: ${station}`);
        
        // Get data for this specific station only
        const stationData = sliced.filter(d => d.source2 === station);
        
        if (stationData.length < 10) {
          console.log(`Skipping ${station}: insufficient data points (${stationData.length})`);
          return;
        }

        // Extract CV differences for this station
        const stationRefSysDifferences = stationData.map(item => item.avgRefsysDifference);
        
        console.log(`${station}: ${stationRefSysDifferences.length} CV Diff points, range: ${Math.min(...stationRefSysDifferences).toFixed(2)} to ${Math.max(...stationRefSysDifferences).toFixed(2)} ns`);

        // Calculate MDEV for this station
        const mdevData = this.calculateMDEV(stationRefSysDifferences, 960); // 960s = 16 minutes typical interval
        
        // Calculate TDEV from MDEV for this station
        const tdevData = this.calculateTDEV(mdevData);

        console.log(`${station}: MDEV=${mdevData.length} points, TDEV=${tdevData.length} points`);

        allMdevData.push({ station, data: mdevData });
        allTdevData.push({ station, data: tdevData });
      });

      if (allTdevData.length === 0) {
        this.error = 'No receivers had sufficient data points for TDEV analysis.';
        this.isLoading = false;
        return;
      }

      console.log(`\nFinal TDEV calculation: ${allTdevData.length} receivers processed`);

      // Plot TDEV results for all receivers
      this.plotTimeDeviationMultiReceiver(allMdevData, allTdevData);
      this.showTdevAnalysis = true;
      
    } catch (error) {
      console.error('Error calculating TDEV for location', this.dataIdentifier, ':', error);
      this.error = `Error calculating Time Deviation for ${this.dataIdentifier}. Please check the data quality.`;
    } finally {
      this.isLoading = false;
    }
  }

  private calculateMDEV(data: number[], tau0: number): { tau: number; MDEV: number }[] {
    const results = [];
    let zeroMdevCount = 0;

    const calculateXk = (y: number[], m: number): number[] => {
      const xk1: number[] = [];
      for (let i = 0; i < y.length - (m - 1); i++) {
        let sum = 0;
        for (let j = i; j < i + m; j++) {
          sum += y[j];
        }
        xk1.push(sum / m);
      }
      return xk1.map(val => Math.round(val * 1000) / 1000);
    };

    const N = data.length;
    const mValues = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 3600, 5000, 10000];
    const taus = mValues.filter(m => m < N / 4).map(m => m * tau0);

    for (const tau of taus) {
      const m = Math.floor(tau / tau0);
      const xk = calculateXk(data, m);

      const calculateYPrime = (xk: number[], tau: number, m: number): number[] => {
        const yPrime1: number[] = [];
        for (let i = 0; i < xk.length - m; i++) {
          yPrime1.push((xk[i + m] - xk[i]) / tau);
        }
        return yPrime1.map(val => Math.round(val * 1000) / 1000);
      };

      const yPrime = calculateYPrime(xk, tau, m);

      const yDiff1: number[] = [];
      for (let k = 0; k < yPrime.length - m; k++) {
        yDiff1.push(yPrime[k + m] - yPrime[k]);
      }
      const yDiff: number[] = yDiff1.map(val => Math.round(val * 1000) / 1000);

      const sumSquares = yDiff.reduce((acc, val) => acc + val ** 2, 0);

      let MDEV = Math.sqrt(sumSquares / (2 * (N - 3 * m + 1)));

      if (MDEV === 0) {
        zeroMdevCount++;
        if (zeroMdevCount >= 2) {
          console.log('Stopping calculation as MDEV is 0 for 2 consecutive values.');
          break;
        }
      } else {
        zeroMdevCount = 0;
      }

      MDEV *= 1e-9; // Convert to proper units
      results.push({ tau: tau, MDEV: MDEV });
    }

    return results;
  }

  private calculateTDEV(mdevData: { tau: number; MDEV: number }[]): { tau: number; TDEV: number }[] {
    return mdevData.map(entry => ({
      tau: entry.tau,
      TDEV: (entry.tau * entry.MDEV) / Math.sqrt(3),
    }));
  }

  private plotTimeDeviationMultiReceiver(
    allMdevData: { station: string; data: { tau: number; MDEV: number }[] }[], 
    allTdevData: { station: string; data: { tau: number; TDEV: number }[] }[]
  ): void {
    console.log('Plotting time deviation for multiple receivers...');

    // Use the first station's tau values as labels (they should all be the same)
    const labels = allTdevData[0]?.data.map(entry => entry.tau.toString()) || [];

    const datasets: any[] = [];

    // 🎨 Use same consistent color scheme as plot view
    const getConsistentColorForStation = (station: string): string => {
      const currentLocationSources = this.locationStationMap[this.dataIdentifier] ?? [];
      const stationIndex = currentLocationSources.indexOf(station);
      
      const consistentColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
        '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#06B6D4',
        '#84CC16', '#A855F7', '#E11D48', '#0891B2', '#65A30D'
      ];
      
      if (stationIndex !== -1 && stationIndex < consistentColors.length) {
        return consistentColors[stationIndex];
      }
      
      return this.getRandomColor();
    };

    // Add MDEV datasets for each receiver
    allMdevData.forEach(({ station, data }) => {
      const color = getConsistentColorForStation(station);
      datasets.push({
        data: data.map(entry => entry.MDEV),
        label: `${getReceiverDisplayName(station)} MDEV`,
        borderColor: color,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1,
        borderDash: [5, 5], // Dashed line for MDEV
        pointRadius: 2,
      });
    });

    // Add TDEV datasets for each receiver  
    allTdevData.forEach(({ station, data }) => {
      const color = getConsistentColorForStation(station);
      datasets.push({
        data: data.map(entry => entry.TDEV),
        label: `${getReceiverDisplayName(station)} TDEV`,
        borderColor: color,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1,
        borderWidth: 2, // Solid thicker line for TDEV
        pointRadius: 3,
      });
    });

    this.tdevChartData = {
      labels,
      datasets,
    };

    console.log(`Time deviation chart data: ${datasets.length} datasets for ${allTdevData.length} receivers`);
  }

  // Keep the old method for backward compatibility, but mark as deprecated
  private plotTimeDeviation(mdevData: any[], tdevData: any[]): void {
    console.log('Plotting time deviation...');

    const labels = tdevData.map(entry => entry.tau.toString());

    const mdevDataset = {
      data: mdevData.map(entry => entry.MDEV),
      label: 'Modified Allan Deviation (MDEV)',
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1,
    };

    const tdevDataset = {
      data: tdevData.map(entry => entry.TDEV),
      label: 'Time Deviation (TDEV)',
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1,
    };

    this.tdevChartData = {
      labels,
      datasets: [mdevDataset, tdevDataset],
    };

    console.log('Time deviation chart data:', this.tdevChartData);
  }

  downloadTdevCSV(): void {
    if (!this.tdevChartData) {
      console.error('No TDEV data available for download.');
      return;
    }

    // Build CSV header with all receiver columns
    const mdevDatasets = this.tdevChartData.datasets.filter(d => d.label?.includes('MDEV'));
    const tdevDatasets = this.tdevChartData.datasets.filter(d => d.label?.includes('TDEV'));

    let csvHeader = 'Averaging Time (τ)';

    // Add MDEV columns for each receiver
    mdevDatasets.forEach(dataset => {
      // If label is already mapped, use as is, else map
      let receiver = dataset.label?.replace(' MDEV', '') || 'Unknown';
      receiver = getReceiverDisplayName(receiver);
      csvHeader += `,${receiver} MDEV`;
    });

    // Add TDEV columns for each receiver
    tdevDatasets.forEach(dataset => {
      let receiver = dataset.label?.replace(' TDEV', '') || 'Unknown';
      receiver = getReceiverDisplayName(receiver);
      csvHeader += `,${receiver} TDEV`;
    });

    csvHeader += '\n';

    // Build CSV rows with exponential formatting
    const csvRows = (this.tdevChartData.labels as string[])?.map((label: string, i: number) => {
      let row = label;

      // Add MDEV values for each receiver in exponential format
      mdevDatasets.forEach(dataset => {
        const value = dataset.data[i];
        const formattedValue = (value != null && typeof value === 'number') ? value.toExponential(2) : '';
        row += `,${formattedValue}`;
      });

      // Add TDEV values for each receiver in exponential format
      tdevDatasets.forEach(dataset => {
        const value = dataset.data[i];
        const formattedValue = (value != null && typeof value === 'number') ? value.toExponential(2) : '';
        row += `,${formattedValue}`;
      });

      return row;
    }).join('\n') || '';

    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TDEV_Analysis_AllReceivers_${this.dataIdentifier}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPlotCSV(): void {
    if (!this.plotChartData || !this.plotChartData.labels || !this.plotChartData.datasets) {
      console.error('No plot data available for download.');
      return;
    }

    // Build CSV header: Time, Receiver1, Receiver2, ...
    const header = ['Time'];
    this.plotChartData.datasets.forEach((ds: any) => {
      header.push(getReceiverDisplayName(ds.label) || 'Receiver');
    });
    const csvHeader = header.join(',') + '\n';

    // Build CSV rows
    const labels = this.plotChartData.labels as string[];
    const rows = labels.map((label: string, i: number) => {
      const row = [`"${label}"`];
      this.plotChartData.datasets.forEach((ds: any) => {
        const value = ds.data[i];
        row.push((value != null && typeof value === 'number') ? value.toFixed(2) : '');
      });
      return row.join(',');
    });
    const csvContent = csvHeader + rows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CV_Diff_AllReceivers_${this.dataIdentifier}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Getter to calculate the actual displayed data count based on limit
  get displayedDataCount(): number {
    if (!this.filteredData || this.filteredData.length === 0) {
      return 0;
    }
    return this.dataLimit === -1 ? this.filteredData.length : Math.min(this.dataLimit, this.filteredData.length);
  }
}

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { getReceiverDisplayName } from '../../receiver-display-name.map';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, combineLatest, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SatDataService } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';
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
  selector: 'app-fast-plot-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './fast-plot-view.component.html',
  styleUrls: ['./fast-plot-view.component.css'],
})
export class FastPlotViewComponent implements OnInit, OnDestroy {
  // Raw data from API (cached)
  allData: SatData[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  // Filtered data for charts
  filteredData: SatData[] = [];
  
  // Chart configuration
  chartData: any;
  chartOptions: any;
  
  // Data display limits
  dataLimit = 100;
  dataLimits = [25, 50, 100, 200, -1]; // -1 means all data
  
  // Filtering
  selectedFilter = 'NAVIC'; // Default to NAVIC instead of ALL
  
  // UI state
  loading = false;
  
  // Component lifecycle
  private destroy$ = new Subject<void>();
  
  // Route parameters
  dataIdentifier?: string;
  
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
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];
    this.setupDataPipeline();
  }

  private setupDataPipeline(): void {
    this.loading = true;

    combineLatest([
      this.filterService.filter$,
      this.dateRangeService.dateRange$
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([filter, dateRange]) => {
        this.loading = true;
        this.selectedFilter = filter;
        
        const source2Codes = this.dataIdentifier 
          ? locationSource2Map[this.dataIdentifier] ?? null 
          : null;

        if (source2Codes) {
          return this.satDataService.getBulkLocationData(source2Codes, dateRange.start, dateRange.end).pipe(
            catchError(error => {
              console.error('Error loading bulk location data, falling back to home page logic:', error);
              return this.loadFallbackData(dateRange.start, dateRange.end);
            })
          );
        } else {
          return this.loadFallbackData(dateRange.start, dateRange.end);
        }
      })
    ).subscribe({
      next: (response) => {
        this.allData = response.data;
        console.log(`✅ Plot data pipeline loaded ${this.allData.length} records (cached: ${response.cached})`);
        this.applyFilters();
        this.updateChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Final fallback in plot data pipeline failed:', error);
        this.allData = [];
        this.applyFilters();
        this.updateChartData();
        this.loading = false;
      }
    });
  }

  private loadFallbackData(startDate: string, endDate: string) {
    const allSource2Values = Object.values(locationSource2Map).flat();
    return this.satDataService.getBulkLocationData(allSource2Values, startDate, endDate).pipe(
      catchError(error => {
        console.error('❌ Error loading optimized home page plot data:', error);
        return of({ data: [], cached: false }); // Return empty on failure
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilters(): void {
    let filtered = [...this.allData];

    if (this.selectedFilter && this.selectedFilter !== 'ALL') {
      if (this.selectedFilter === 'NAVIC') {
        filtered = filtered.filter(item => item.satLetter === 'NAVIC');
      } else {
        filtered = filtered.filter(item => item.satLetter === this.selectedFilter);
      }
    }
    
    this.filteredData = filtered;
  }

  private updateChartData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const sortedData = [...this.filteredData].sort((a, b) => 
      new Date(a.mjdDateTime).getTime() - new Date(b.mjdDateTime).getTime()
    );

    const sliced = this.dataLimit === -1 ? sortedData : sortedData.slice(-this.dataLimit);

    const source2Groups: { [key: string]: SatData[] } = {};
    sliced.forEach(item => {
      if (!source2Groups[item.source2]) {
        source2Groups[item.source2] = [];
      }
      source2Groups[item.source2].push(item);
    });

    this.chartData = {
      labels: sliced.map(d => new Date(d.mjdDateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
      datasets: Object.keys(source2Groups).map(source2 => {
        const source2Data = source2Groups[source2];
        const color = this.getColorForSource2(source2);
        
        const dataPoints = sliced.map(labelItem => {
          const matchingPoint = source2Data.find(dataItem => dataItem.mjdDateTime === labelItem.mjdDateTime);
          return matchingPoint ? matchingPoint.avgRefsysDifference : null;
        });

        return {
          label: getReceiverDisplayName(source2),
          data: dataPoints,
          borderColor: color,
          backgroundColor: color + '20',
          pointBorderColor: color,
          pointBackgroundColor: color,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.3,
          spanGaps: true,
        };
      })
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 15 } },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (ctx: any) => `Time: ${ctx[0].label}`,
            label: (ctx: any) => ctx.raw !== null ? `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)} ns` : ''
          }
        }
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
  }

  private getColorForSource2(source2: string): string {
    const currentLocationSources = this.dataIdentifier 
      ? locationSource2Map[this.dataIdentifier] ?? []
      : [];
    
    const sourceIndex = currentLocationSources.indexOf(source2);
    
    const consistentColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', 
      '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#A855F7', '#E11D48', '#0891B2', '#65A30D'
    ];
    
    if (sourceIndex !== -1 && sourceIndex < consistentColors.length) {
      return consistentColors[sourceIndex];
    }
    
    let hash = 0;
    for (let i = 0; i < source2.length; i++) {
      hash = source2.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  public getPlotTitle(): string {
    if (!this.dataIdentifier) {
      return 'Common-View Time Transfer Performance';
    }
    const locationAbbr = this.locationAbbreviationMap[this.dataIdentifier] || this.dataIdentifier.toUpperCase();
    const locationName = this.dataIdentifier.charAt(0).toUpperCase() + this.dataIdentifier.slice(1);
    
    return `Common-View Time Transfer Performance between NPLI and ${locationName} (${locationAbbr})`;
  }

  onDataLimitChange(): void {
    this.updateChartData();
  }

  getStatistics(field: 'avg1' | 'avg2' | 'avgRefsysDifference'): { min: number; max: number; avg: number } {
    if (this.filteredData.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = this.filteredData.map(item => item[field]).filter(val => !isNaN(val));
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return { min: Number(min.toFixed(2)), max: Number(max.toFixed(2)), avg: Number(avg.toFixed(2)) };
  }

  public downloadPlot(): void {
    if (!this.chart?.chart) return;
    const chartCanvas = this.chart.chart.canvas;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = chartCanvas.width;
    tempCanvas.height = chartCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(chartCanvas, 0, 0);
    const link = document.createElement('a');
    link.href = tempCanvas.toDataURL('image/png');
    link.download = `common-view-plot-${this.dataIdentifier || 'all'}-${new Date().toISOString()}.png`;
    link.click();
  }
}

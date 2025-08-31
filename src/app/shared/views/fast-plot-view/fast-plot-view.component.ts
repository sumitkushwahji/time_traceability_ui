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
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  filteredData: SatData[] = [];
  chartData: any;
  chartOptions: any;

  // Properties for date inputs
  startDate: string;
  endDate: string;
  
  selectedFilter = 'NAVIC';
  loading = false;
  private destroy$ = new Subject<void>();
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
  ) {
    // Initialize date properties to the last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Format for the <input type="datetime-local"> element
    this.endDate = this.formatDateForInput(now);
    this.startDate = this.formatDateForInput(yesterday);
  }

  ngOnInit(): void {
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];
    
    // Set the initial date range in the service to trigger the first data load
    this.dateRangeService.setDateRange(
      new Date(this.startDate).toISOString(), 
      new Date(this.endDate).toISOString()
    );
    
    this.setupDataPipeline();
  }

  // Helper function to format date for the datetime-local input
  private formatDateForInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
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
        
        // Fetch all data within the date range by setting a high limit.
        const effectiveLimit = 10000; 

        const source2Codes = this.dataIdentifier 
          ? locationSource2Map[this.dataIdentifier] ?? null 
          : null;

        if (source2Codes) {
          return this.satDataService.getOptimizedSatData(
            source2Codes, 0, effectiveLimit, 'mjd_date_time', 'desc',
            dateRange.start, dateRange.end, filter
          ).pipe(
            catchError(error => {
              console.error('Error loading optimized location data, falling back:', error);
              return this.loadFallbackData(dateRange.start, dateRange.end, filter, effectiveLimit);
            })
          );
        } else {
          return this.loadFallbackData(dateRange.start, dateRange.end, filter, effectiveLimit);
        }
      })
    ).subscribe({
      next: (response) => {
        this.filteredData = response.content.reverse();
        console.log(`✅ Plot data pipeline loaded ${this.filteredData.length} records`);
        this.updateChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Final fallback in plot data pipeline failed:', error);
        this.filteredData = [];
        this.updateChartData();
        this.loading = false;
      }
    });
  }

  private loadFallbackData(startDate: string, endDate: string, satLetter: string, size: number) {
    const allSource2Values = Object.values(locationSource2Map).flat();
    return this.satDataService.getOptimizedSatData(
      allSource2Values, 0, size, 'mjd_date_time', 'desc', 
      startDate, endDate, satLetter
    ).pipe(
      catchError(error => {
        console.error('❌ Error loading optimized home page plot data:', error);
        return of({ content: [], totalElements: 0 });
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  public onDateRangeChange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).toISOString();
      const end = new Date(this.endDate).toISOString();
      this.dateRangeService.setDateRange(start, end);
    }
  }

  private updateChartData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const dataToPlot = this.filteredData;

    const source2Groups: { [key: string]: SatData[] } = {};
    dataToPlot.forEach(item => {
      if (!source2Groups[item.source2]) {
        source2Groups[item.source2] = [];
      }
      source2Groups[item.source2].push(item);
    });

    this.chartData = {
      labels: dataToPlot.map(d => new Date(d.mjdDateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
      datasets: Object.keys(source2Groups).map(source2 => {
        const source2Data = source2Groups[source2];
        const color = this.getColorForSource2(source2);
        
        const dataPoints = dataToPlot.map(labelItem => {
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
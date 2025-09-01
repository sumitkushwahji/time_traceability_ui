import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Subject, takeUntil, combineLatest, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChartData, ChartOptions } from 'chart.js';
import { SatDataService, PivotedDataResponse } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';
import { getReceiverDisplayName } from '../../receiver-display-name.map';

// Define the interface for the pivoted data structure
interface SatPivotedData {
  id: string;
  satLetter: string;
  mjd: number;
  mjdDateTime: string;
  sttime: string;
  locationDiffs: { [key: string]: number | undefined };
}

@Component({
  selector: 'app-plot-view',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './plot-view.component.html',
  styleUrls: ['./plot-view.component.css'],
})
export class PlotViewComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private destroy$ = new Subject<void>();

  // Data and Chart State
  plotData: SatPivotedData[] = [];
  chartData: ChartData<'line'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions = { /* Chart options are initialized below */ };
  
  // Filtering and UI State
  isLoading = false;
  selectedFilter = 'ALL';
  startDate: string;
  endDate: string;
  isBrowser = false;

  constructor(
    private satDataService: SatDataService,
    private filterService: FilterService,
    private dateRangeService: DateRangeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  // Set default end date to yesterday and start date to 5 days before that
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const fiveDaysAgo = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 5);

  this.endDate = this.formatDateForInput(yesterday);
  this.startDate = this.formatDateForInput(fiveDaysAgo);
  this.initializeChartOptions();
  }

  ngOnInit(): void {
    // Set the initial date range to trigger the first data load
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
    if (!this.isBrowser) return;

    combineLatest([
      this.filterService.filter$,
      this.dateRangeService.dateRange$
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([filter, dateRange]) => {
        this.isLoading = true;
        this.selectedFilter = filter;
        // Fetch all relevant data for the plot; a large size effectively disables pagination for the given range
        return this.satDataService.getPivotedSatData2(0, 10000, dateRange.start, dateRange.end, filter)
          .pipe(catchError(() => of({ content: [], totalElements: 0 })));
      })
    ).subscribe(response => {
      this.plotData = response.content.sort((a, b) => 
        new Date(a.mjdDateTime).getTime() - new Date(b.mjdDateTime).getTime()
      );
      this.updateChartData();
      this.isLoading = false;
    });
  }

  private initializeChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 15 } },
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            title: (ctx: any) => `Time: ${ctx[0].label}`,
            label: (ctx: any) => ctx.raw !== null ? `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)} ns` : ''
          }
        },
      },
      scales: {
        x: { title: { display: true, text: 'Time (Indian Standard Time)' } },
        y: { title: { display: true, text: 'Time Difference (ns)' } },
      },
    };
  }

  private updateChartData(): void {
    if (this.plotData.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    this.chartData = {
      labels: this.plotData.map(d => new Date(d.mjdDateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
      datasets: this.buildDatasets(this.plotData),
    };
  }

  private buildDatasets(data: SatPivotedData[]) {
    const allLocations = new Set<string>();
    data.forEach(d => Object.keys(d.locationDiffs).forEach(loc => allLocations.add(loc)));
    
    const consistentColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', 
      '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#A855F7', '#E11D48', '#0891B2', '#65A30D'
    ];
    const locationArray = Array.from(allLocations).sort();

    return locationArray.map((loc, index) => {
      let color: string;
      if (index < consistentColors.length) {
          // Use a predefined color for consistency
          color = consistentColors[index];
      } else {
          // Fallback to a hash-based color for uniqueness if we run out of predefined colors
          let hash = 0;
          for (let i = 0; i < loc.length; i++) {
              hash = loc.charCodeAt(i) + ((hash << 5) - hash);
          }
          const hue = Math.abs(hash) % 360;
          color = `hsl(${hue}, 70%, 50%)`;
      }
      
      return {
        label: getReceiverDisplayName(loc),
        data: data.map(d => d.locationDiffs[loc] ?? null),
        borderColor: color,
        backgroundColor: color + '20',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.3,
      };
    });
  }

  public onDateRangeChange(): void {
    this.dateRangeService.setDateRange(
      new Date(this.startDate).toISOString(),
      new Date(this.endDate).toISOString()
    );
  }

  private formatDateForInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
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
    link.download = `plot-view-${new Date().toISOString()}.png`;
    link.click();
  }
}


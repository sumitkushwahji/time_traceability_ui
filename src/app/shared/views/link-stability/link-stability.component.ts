import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, combineLatest, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { SatDataService } from '../../../services/sat-data.service';
import { getReceiverDisplayName } from '../../receiver-display-name.map';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';
import { locationSource2Map } from '../../location-source2.map';

// Updated interface to include weighted difference
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
  weightedAvgDifference: number;
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
  
  // Data and Chart State
  filteredData: SatData[] = [];
  plotChartData: any;
  tdevChartData: ChartConfiguration["data"] | null = null;
  plotChartOptions: any;
  tdevChartOptions: any;

  // View Controls
  plotView = { standard: true, weighted: false };
  startDate: string;
  endDate: string;

  // Filtering State
  selectedFilter = 'ALL';
  dataIdentifier = '';
  
  // UI State
  isLoading = false;
  error: string | null = null;
  showTdevAnalysis = false;
  isBrowser = false;

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
    // Initialize date properties to the last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.endDate = this.formatDateForInput(now);
    this.startDate = this.formatDateForInput(yesterday);
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'] || '';
    this.updateChartTitles();
    // Set the initial date range in the service to trigger the first data load
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
    this.isLoading = true;
    combineLatest([
      this.filterService.filter$,
      this.dateRangeService.dateRange$
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([filter, dateRange]) => {
        this.isLoading = true;
        this.selectedFilter = filter;
        
        const source2Codes = this.dataIdentifier 
          ? locationSource2Map[this.dataIdentifier]
          : Object.values(locationSource2Map).flat();

        if (!source2Codes || source2Codes.length === 0) {
            this.error = 'Invalid location identifier.';
            return of({ content: [], totalElements: 0 });
        }
        
        return this.satDataService.getOptimizedSatData(
            source2Codes, 0, 10000, 'mjd_date_time', 'desc', 
            dateRange.start, dateRange.end, this.selectedFilter !== 'ALL' ? this.selectedFilter : null
        ).pipe(
            catchError(err => {
                console.error('Error loading data for Link Stability:', err);
                this.error = 'Failed to load data.';
                return of({ content: [], totalElements: 0 });
            })
        );
      })
    ).subscribe(response => {
        this.filteredData = (response.content as SatData[]).reverse();
        this.updatePlotChart();
        this.isLoading = false;
    });
  }
  
  private initializeChartOptions(): void {
    this.plotChartOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 15 } },
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            title: (ctx: any) => `Time: ${ctx[0].label}`,
            label: (ctx: any) => ctx.raw !== null ? `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)} ns` : ''
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Time (Indian Standard Time)' } },
        y: { title: { display: true, text: 'Time Difference (ns)' } },
      },
    };
    this.tdevChartOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '', font: { size: 16, weight: 'bold' } },
        legend: { position: 'top' as const },
      },
      scales: {
        x: { type: 'logarithmic', title: { display: true, text: 'Averaging Time τ (seconds)' } },
        y: { type: 'logarithmic', title: { display: true, text: 'Time Deviation (ns)' } },
      },
    };
  }

  private updateChartTitles(): void {
    if (!this.dataIdentifier) {
        this.plotChartOptions.plugins.title.text = 'Link Stability Analysis';
        this.tdevChartOptions.plugins.title.text = 'Time Deviation Analysis';
        return;
    }
    const locationAbbr = this.locationAbbreviationMap[this.dataIdentifier] || this.dataIdentifier.toUpperCase();
    const locationName = this.dataIdentifier.charAt(0).toUpperCase() + this.dataIdentifier.slice(1);
    const plotTitle = `Link Stability between NPLI and ${locationName} (${locationAbbr})`;
    if (this.plotChartOptions?.plugins?.title) this.plotChartOptions.plugins.title.text = plotTitle;
    if (this.tdevChartOptions?.plugins?.title) this.tdevChartOptions.plugins.title.text = `TDEV - ${plotTitle}`;
  }
  
  public setPlotView(view: 'standard' | 'weighted' | 'both'): void {
    this.plotView = {
        standard: view === 'standard' || view === 'both',
        weighted: view === 'weighted' || view === 'both'
    };
    this.updatePlotChart();
  }

  private updatePlotChart(): void {
    const dataToPlot = this.filteredData;
    if (dataToPlot.length === 0) {
        this.plotChartData = { labels: [], datasets: [] };
        return;
    }
    const datasets: any[] = [];
    const source2Groups: { [key: string]: SatData[] } = {};
    dataToPlot.forEach(item => {
        if (!source2Groups[item.source2]) source2Groups[item.source2] = [];
        source2Groups[item.source2].push(item);
    });
    Object.keys(source2Groups).forEach(source2 => {
        const source2Data = source2Groups[source2];
        if (this.plotView.standard) {
            const color = this.getColorForSource2(source2);
            datasets.push(this.createDataSet(dataToPlot, source2Data, 'standard', color));
        }
        if (this.plotView.weighted) {
            const color = this.plotView.standard ? this.getModifiedColor(this.getColorForSource2(source2)) : this.getColorForSource2(source2);
            datasets.push(this.createDataSet(dataToPlot, source2Data, 'weighted', color));
        }
    });
    this.plotChartData = {
        labels: dataToPlot.map(d => new Date(d.mjdDateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
        datasets,
    };
  }

  private createDataSet(allData: SatData[], groupData: SatData[], type: 'standard' | 'weighted', color: string) {
    const field = type === 'standard' ? 'avgRefsysDifference' : 'weightedAvgDifference';
    return {
        label: this.getDynamicDisplayName(groupData[0].source2, type),
        data: allData.map(d => groupData.find(p => p.mjdDateTime === d.mjdDateTime)?.[field] ?? null),
        borderColor: color,
        backgroundColor: color + '20',
        borderDash: type === 'weighted' ? [5, 5] : [],
        pointRadius: 3, fill: false, tension: 0.3
    };
  }
  
  public onDateRangeChange(): void {
    if (this.startDate && this.endDate) {
      this.dateRangeService.setDateRange(
          new Date(this.startDate).toISOString(), 
          new Date(this.endDate).toISOString()
      );
    }
  }
  
  public calculateTimeDeviation(): void {
    const dataForTdev = this.filteredData;
    if (dataForTdev.length < 10) {
        this.error = 'Insufficient data points for TDEV analysis. Need at least 10.';
        return;
    }
    this.isLoading = true;
    this.error = null;
    this.showTdevAnalysis = true; // Show the section immediately with a loading state if needed
    
    // Asynchronous calculation to prevent UI freeze
    setTimeout(() => {
        try {
            const allTdevResults: any[] = [];
            if (this.plotView.standard) {
                allTdevResults.push(...this.calculateTDEVForField(dataForTdev, 'avgRefsysDifference'));
            }
            if (this.plotView.weighted) {
                allTdevResults.push(...this.calculateTDEVForField(dataForTdev, 'weightedAvgDifference'));
            }
            this.plotTimeDeviationMultiReceiver(allTdevResults);
        } catch (e) {
            console.error("TDEV calculation failed:", e);
            this.error = "An error occurred during TDEV calculation.";
            this.showTdevAnalysis = false;
        } finally {
            this.isLoading = false;
        }
    }, 50);
  }

  private calculateTDEVForField(data: SatData[], field: 'avgRefsysDifference' | 'weightedAvgDifference') {
    const allStations = [...new Set(data.map(d => d.source2))];
    return allStations.map(station => {
        const stationData = data.filter(d => d.source2 === station && d[field] != null).map(d => d[field]);
        if (stationData.length >= 10) {
            const mdev = this.calculateMDEV(stationData, 960);
            return { station, field, data: this.calculateTDEV(mdev) };
        }
        return null;
    }).filter(Boolean);
  }
  
  private calculateMDEV(data: number[], tau0: number): { tau: number; MDEV: number }[] {
    const results: { tau: number; MDEV: number }[] = [];
    const N = data.length;
    for (let m = 1; m < N / 3; m = Math.floor(m * 1.4) + 1) { // Adjusted step for performance
      const tau = m * tau0;
      let sumOfSquares = 0;
      const nMax = N - (3 * m) + 1;
      if (nMax <= 0) continue;

      for (let i = 0; i < nMax; i++) {
        const s1 = data.slice(i, i + m).reduce((a, b) => a + b, 0);
        const s2 = data.slice(i + m, i + 2*m).reduce((a, b) => a + b, 0);
        const s3 = data.slice(i + 2*m, i + 3*m).reduce((a, b) => a + b, 0);
        sumOfSquares += (s3 - 2 * s2 + s1) ** 2;
      }
      const mdev = Math.sqrt(sumOfSquares / (2 * (m ** 2) * (tau0 ** 2) * nMax));
      results.push({ tau, MDEV: mdev });
    }
    return results;
  }
  
  private calculateTDEV(mdevData: { tau: number; MDEV: number }[]): { tau: number; TDEV: number }[] {
    return mdevData.map(entry => ({ tau: entry.tau, TDEV: (entry.tau * entry.MDEV) / Math.sqrt(3) }));
  }

  private plotTimeDeviationMultiReceiver(allTdevData: any[]): void {
      if (allTdevData.length === 0) {
        this.tdevChartData = { labels: [], datasets: [] };
        this.error = "Not enough data for any station to calculate TDEV.";
        return;
      }
      const labels = allTdevData[0]?.data.map((entry: any) => entry.tau.toString()) || [];
      const datasets = allTdevData.map(({ station, field, data }) => {
          const type = field === 'avgRefsysDifference' ? 'standard' : 'weighted';
          const color = this.plotView.standard && this.plotView.weighted && type === 'weighted' 
              ? this.getModifiedColor(this.getColorForSource2(station)) 
              : this.getColorForSource2(station);
          return {
              data: data.map((entry: any) => entry.TDEV),
              label: `${this.getDynamicDisplayName(station, type)} TDEV`,
              borderColor: color,
              borderDash: type === 'weighted' ? [5, 5] : [],
              backgroundColor: 'transparent', fill: false, tension: 0.1, borderWidth: 2, pointRadius: 3,
          };
      });
      this.tdevChartData = { labels, datasets };
  }
  
  getStatistics(field: 'avgRefsysDifference' | 'weightedAvgDifference'): { min: number; max: number; avg: number } {
    const dataSet = this.filteredData;
    if (dataSet.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = dataSet.map(item => item[field]).filter(val => typeof val === 'number' && !isNaN(val)) as number[];
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return { min: Number(min.toFixed(2)), max: Number(max.toFixed(2)), avg: Number(avg.toFixed(2)) };
  }

  private getDynamicDisplayName(code: string, type: 'standard' | 'weighted'): string {
    const baseName = getReceiverDisplayName(code);
    const suffix = type === 'standard' ? '_CV' : '_AV';
    return baseName.endsWith('_CV') ? baseName.slice(0, -3) + suffix : baseName + suffix;
  }
  
  private getColorForSource2(source2: string): string {
    const allSource2Values = this.dataIdentifier ? locationSource2Map[this.dataIdentifier] ?? [] : Object.values(locationSource2Map).flat();
    const sourceIndex = allSource2Values.indexOf(source2);
    const consistentColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#A855F7', '#E11D48', '#0891B2', '#65A30D'];
    if (sourceIndex !== -1) return consistentColors[sourceIndex % consistentColors.length];
    let hash = 0;
    for (let i = 0; i < source2.length; i++) hash = source2.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  }

  private getModifiedColor(color: string): string {
    if (color.startsWith('hsl')) {
        const parts = color.match(/\d+/g);
        if (parts) return `hsl(${(parseInt(parts[0], 10) + 40) % 360}, 80%, 70%)`;
    }
    const hash = color.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return `hsl(${Math.abs(hash) % 360}, 80%, 70%)`;
  }

  private formatDateForInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
  }
}


import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID, Input, ViewChild } from '@angular/core';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { SatData2, SatDataService } from '../../../services/sat-data.service';
import { getReceiverDisplayName } from '../../receiver-display-name.map';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-plot-view',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './plot-view.component.html',
  styleUrls: ['./plot-view.component.css'],
})
export class PlotViewComponent implements OnInit, OnDestroy {
  @Input() dataType: 'all' | 'specific' = 'all';
  @Input() dataIdentifier?: string;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  rawData: SatData2[] = [];
  filteredData: SatData2[] = [];
  chartData: ChartData<'line'> = { labels: [], datasets: [] };

  dataLimits = [10, 20, 50, 100, 200, 500, -1];
  dataLimit = 100;

  startDate = '';
  endDate = '';

  private destroy$ = new Subject<void>();

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 15,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (ctx: any) => `Time: ${ctx[0].label}`,
          label: (ctx: any) => ctx.raw !== null ? `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}` : '',
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Time (Indian Standard Time)' } },
      y: { title: { display: true, text: 'Time Difference (ns)' } },
    },
    interaction: { mode: 'index', intersect: false },
  };

  isBrowser = false;

  constructor(
    private satDataService: SatDataService,
    public filterService: FilterService,  // made public
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // default last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    this.filterService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter) => this.applyFilter(filter));

    if (this.isBrowser) {
      this.fetchPlotData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchPlotData(): void {
    if (this.dataType === 'all') {
      this.satDataService.getPivotedSatDataForPlot().subscribe((data: SatData2[]) => {
        this.rawData = data;
        this.applyFilter(this.filterService.getCurrentFilter());
      });
    } else if (this.dataType === 'specific' && this.dataIdentifier) {
      this.satDataService.getPivotedSatDataForPlot(this.dataIdentifier).subscribe((data: SatData2[]) => {
        this.rawData = data;
        this.applyFilter(this.filterService.getCurrentFilter());
      });
    } else {
      this.dataType = 'all';
      this.fetchPlotData();
    }
  }

  applyFilter(filter: string): void {
    if (!this.rawData.length) return;

    // Filter by satellite system
    if (filter === 'ALL') {
      this.filteredData = this.rawData;
    } else if (filter === 'GPS') {
      this.filteredData = this.rawData.map(d => ({
        ...d,
        locationDiffs: this.filterLocationDiffsBySystem(d.locationDiffs, 'G')
      })).filter(d => Object.keys(d.locationDiffs).length > 0);
    } else if (filter === 'NAVIC') {
      this.filteredData = this.rawData.map(d => ({
        ...d,
        locationDiffs: this.filterLocationDiffsBySystem(d.locationDiffs, 'IR')
      })).filter(d => Object.keys(d.locationDiffs).length > 0);
    } else if (filter === 'GLONASS') {
      this.filteredData = this.rawData.map(d => ({
        ...d,
        locationDiffs: this.filterLocationDiffsBySystem(d.locationDiffs, 'R')
      })).filter(d => Object.keys(d.locationDiffs).length > 0);
    } else {
      this.filteredData = this.rawData;
    }

    // Filter by date
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      this.filteredData = this.filteredData.filter(d => {
        const time = new Date(d.mjdDateTime).getTime();
        return time >= start && time <= end;
      });
    }

    this.updateChartData();
  }

  filterLocationDiffsBySystem(locationDiffs: { [key: string]: number }, systemPrefix: string) {
    const filtered: { [key: string]: number } = {};
    Object.keys(locationDiffs).forEach(key => {
      if (systemPrefix === 'IR') {
        if (key.toUpperCase().startsWith('IR')) filtered[key] = locationDiffs[key];
      } else {
        if (key.toUpperCase().startsWith(systemPrefix)) filtered[key] = locationDiffs[key];
      }
    });
    return filtered;
  }

  updateChartData() {
    const sliced = this.dataLimit === -1 ? this.filteredData : this.filteredData.slice(-this.dataLimit);

    this.chartData = {
      labels: sliced.map(d => new Date(d.mjdDateTime).toLocaleString()),
      datasets: this.buildDatasets(sliced),
    };
  }

  buildDatasets(data: SatData2[]) {
    const allLocations = new Set<string>();
    data.forEach(d => Object.keys(d.locationDiffs).forEach(loc => allLocations.add(loc)));

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#06B6D4',
      '#84CC16', '#A855F7', '#E11D48', '#0891B2', '#65A30D',
    ];

    return Array.from(allLocations).map((loc, index) => {
      const color = colors[index % colors.length];
      return {
        label: getReceiverDisplayName(loc),
        data: data.map(d => d.locationDiffs[loc] ?? null),
        borderColor: color,
        backgroundColor: color + '33',
        pointBorderColor: color,
        pointBackgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.3,
      };
    });
  }

  downloadPlot(): void {
    if (!this.chart || !this.chart.chart) return;
    const canvas = this.chart.chart.canvas as HTMLCanvasElement;
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const ctx = temp.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, temp.width, temp.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.href = temp.toDataURL('image/png');
    link.download = `plot-${this.dataIdentifier || 'all'}-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

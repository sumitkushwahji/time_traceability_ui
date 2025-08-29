import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SatDataService } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';
import { locationSource2Map } from '../../location-source2.map';
import { getReceiverDisplayName } from '../../receiver-display-name.map';

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

  allData: SatData[] = [];
  filteredData: SatData[] = [];
  chartData: any = { labels: [], datasets: [] };
  chartOptions: any;

  dataLimit = 100;
  dataLimits = [25, 50, 100, 200, -1];

  selectedFilter = 'NAVIC';
  startDate = '';
  endDate = '';
  loading = false;

  private destroy$ = new Subject<void>();
  dataIdentifier?: string;

  constructor(
    private satDataService: SatDataService,
    private filterService: FilterService,
    private dateRangeService: DateRangeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Default last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];

    // Subscribe to filter changes
    this.filterService.filter$.pipe(takeUntil(this.destroy$))
      .subscribe(filter => {
        this.selectedFilter = filter;
        this.applyFilters();
        this.updateChartData();
      });

    // Subscribe to external date range changes
    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(range => {
        if (range.start) this.startDate = range.start;
        if (range.end) this.endDate = range.end;
        this.loadData();
      });

    // Load initial data
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;

    const source2Codes = this.dataIdentifier
      ? locationSource2Map[this.dataIdentifier] ?? []
      : Object.values(locationSource2Map).flat();

    this.satDataService.getBulkLocationData(source2Codes, this.startDate, this.endDate)
      .subscribe({
        next: res => {
          this.allData = res.data.map(d => ({ ...d, mjdDateTime: new Date(d.mjdDateTime).toISOString() }));
          this.applyFilters();
          this.updateChartData();
          this.loading = false;
        },
        error: err => {
          console.error('Error loading data:', err);
          this.allData = [];
          this.filteredData = [];
          this.chartData = { labels: [], datasets: [] };
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.allData];

    if (this.selectedFilter && this.selectedFilter !== 'ALL') {
      filtered = filtered.filter(item => item.satLetter === this.selectedFilter);
    }

    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      filtered = filtered.filter(item => {
        const time = new Date(item.mjdDateTime).getTime();
        return time >= start && time <= end;
      });
    }

    this.filteredData = filtered;
  }

  updateChartData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const sorted = [...this.filteredData].sort((a, b) =>
      new Date(a.mjdDateTime).getTime() - new Date(b.mjdDateTime).getTime()
    );

    const sliced = this.dataLimit === -1 ? sorted : sorted.slice(-this.dataLimit);

    const source2Groups: { [key: string]: SatData[] } = {};
    sliced.forEach(item => {
      if (!source2Groups[item.source2]) source2Groups[item.source2] = [];
      source2Groups[item.source2].push(item);
    });

    this.chartData = {
      labels: sliced.map(d => new Date(d.mjdDateTime).toLocaleString()),
      datasets: Object.keys(source2Groups).map(source2 => {
        const dataPoints = sliced.map(d => {
          const match = source2Groups[source2].find(s => s.sttime === d.sttime && s.mjd === d.mjd);
          return match ? match.avgRefsysDifference : null;
        });
        const color = this.getColorForSource2(source2);
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
          spanGaps: true
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
            label: (ctx: any) => ctx.raw !== null ? `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}` : ''
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Time (Indian Standard Time)' } },
        y: { title: { display: true, text: 'Time Difference (ns)' }, grid: { color: 'rgba(0,0,0,0.1)' } }
      },
      interaction: { mode: 'index', intersect: false }
    };
  }

  getColorForSource2(source2: string): string {
    const consistentColors = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#6B7280','#14B8A6','#F97316','#06B6D4'];
    const keys = Object.keys(locationSource2Map).flatMap(k => locationSource2Map[k]);
    const idx = keys.indexOf(source2);
    return idx !== -1 ? consistentColors[idx % consistentColors.length] : '#888888';
  }

  onDataLimitChange(): void { this.updateChartData(); }

  downloadPlot(): void {
    if (!this.chart?.chart) return;
    const canvas = this.chart.chart.canvas as HTMLCanvasElement;
    const temp = document.createElement('canvas');
    temp.width = canvas.width; temp.height = canvas.height;
    const ctx = temp.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, temp.width, temp.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.href = temp.toDataURL('image/png');
    link.download = `plot-${new Date().toISOString()}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }
}

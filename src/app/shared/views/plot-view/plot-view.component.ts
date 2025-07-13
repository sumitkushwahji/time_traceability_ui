import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Input } from '@angular/core'; // Added Input
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { FormsModule } from '@angular/forms';
import { SatData2, SatDataService } from '../../../services/sat-data.service';

@Component({
  selector: 'app-plot-view',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './plot-view.component.html',
  styleUrl: './plot-view.component.css',
})
export class PlotViewComponent implements OnInit {
  // 'all' for dashboard-like views (aggregated data), 'specific' for city-specific views.
  @Input() dataType: 'all' | 'specific' = 'all';
  @Input() dataIdentifier?: string; // e.g., city name if dataType is 'specific'

  rawData: SatData2[] = [];
  chartData: ChartData<'line'> = { labels: [], datasets: [] };

  dataLimits = [10, 20, 50, 100, 200, 500, -1];
  dataLimit = -1;

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { title: { display: true, text: 'MJD DateTime' } },
      y: { title: { display: true, text: 'RefSys Diff' } },
    },
  };

  isBrowser = false;

  constructor(
    private dataService: SatDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.fetchPlotData();
    }
  }

  fetchPlotData(): void {
    if (this.dataType === 'all') {
      this.dataService.getPivotedSatDataForPlot().subscribe((data) => {
        this.rawData = data;
        this.updateChartData();
      });
    } else if (this.dataType === 'specific' && this.dataIdentifier) {
      this.dataService.getPivotedSatDataForPlot(this.dataIdentifier).subscribe((data) => {
        this.rawData = data;
        this.updateChartData();
      });
    } else {
      console.warn('PlotViewComponent: dataType or dataIdentifier not properly set. Defaulting to "all".');
      // Fallback to 'all' data if inputs are not set correctly for 'specific' type
      this.dataType = 'all';
      this.fetchPlotData();
    }
  }

  updateChartData() {
    const sliced = this.dataLimit === -1 ? this.rawData : this.rawData.slice(-this.dataLimit);

    this.chartData = {
      labels: sliced.map(d => new Date(d.mjdDateTime).toLocaleString()),
      datasets: this.buildDatasets(sliced),
    };
  }

  buildDatasets(data: SatData2[]) {
    const allLocations = new Set<string>();
    data.forEach(d => {
      Object.keys(d.locationDiffs).forEach(loc => allLocations.add(loc));
    });

    return Array.from(allLocations).map(loc => {
      const color = this.getRandomColor();

      return {
        label: loc,
        data: data.map(d => d.locationDiffs[loc] ?? null),
        borderColor: color,
        backgroundColor: color,
        pointBorderColor: color,
        pointBackgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.3,
      };
    });
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

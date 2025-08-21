import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID, Input } from '@angular/core'; // Added Input and OnDestroy
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Subject, takeUntil } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { SatData2, SatDataService } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-plot-view',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './plot-view.component.html',
  styleUrl: './plot-view.component.css',
})
export class PlotViewComponent implements OnInit, OnDestroy {
  // 'all' for dashboard-like views (aggregated data), 'specific' for city-specific views.
  @Input() dataType: 'all' | 'specific' = 'all';
  @Input() dataIdentifier?: string; // e.g., city name if dataType is 'specific'

  rawData: SatData2[] = [];
  filteredData: SatData2[] = [];
  chartData: ChartData<'line'> = { labels: [], datasets: [] };

  dataLimits = [10, 20, 50, 100, 200, 500, -1];
  dataLimit = -1;

  private destroy$ = new Subject<void>();

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { title: { display: true, text: 'Time (Indian Standard Time)' } },
      y: { title: { display: true, text: 'RefSys Diff' } },
    },
  };

  isBrowser = false;

  constructor(
    private satDataService: SatDataService,
    private filterService: FilterService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Subscribe to filter changes
    this.filterService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter) => {
        this.applyFilter(filter);
      });

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
        this.filteredData = data;
        
        // Apply current filter state immediately after data loads
        const currentFilter = this.filterService.getCurrentFilter();
        this.applyFilter(currentFilter);
      });
    } else if (this.dataType === 'specific' && this.dataIdentifier) {
      this.satDataService.getPivotedSatDataForPlot(this.dataIdentifier).subscribe((data: SatData2[]) => {
        this.rawData = data;
        this.filteredData = data;
        
        // Apply current filter state immediately after data loads
        const currentFilter = this.filterService.getCurrentFilter();
        this.applyFilter(currentFilter);
      });
    } else {
      console.warn('PlotViewComponent: dataType or dataIdentifier not properly set. Defaulting to "all".');
      // Fallback to 'all' data if inputs are not set correctly for 'specific' type
      this.dataType = 'all';
      this.fetchPlotData();
    }
  }

  applyFilter(filter: string): void {
    if (!this.rawData.length) return;

    if (filter === 'ALL') {
      this.filteredData = this.rawData;
    } else if (filter === 'GPS') {
      // Filter for GPS satellites - need to check the locationDiffs keys for satellites starting with 'G'
      this.filteredData = this.rawData.map(dataPoint => ({
        ...dataPoint,
        locationDiffs: this.filterLocationDiffsBySystem(dataPoint.locationDiffs, 'G')
      })).filter(dataPoint => Object.keys(dataPoint.locationDiffs).length > 0);
    } else if (filter === 'NAVIC') {
      // Filter for NavIC satellites - need to check the locationDiffs keys for satellites starting with 'IR'
      this.filteredData = this.rawData.map(dataPoint => ({
        ...dataPoint,
        locationDiffs: this.filterLocationDiffsBySystem(dataPoint.locationDiffs, 'IR')
      })).filter(dataPoint => Object.keys(dataPoint.locationDiffs).length > 0);
    } else if (filter === 'GLONASS') {
      // Filter for GLONASS satellites - need to check the locationDiffs keys for satellites starting with 'R'
      this.filteredData = this.rawData.map(dataPoint => ({
        ...dataPoint,
        locationDiffs: this.filterLocationDiffsBySystem(dataPoint.locationDiffs, 'R')
      })).filter(dataPoint => Object.keys(dataPoint.locationDiffs).length > 0);
    } else {
      // For specific satellite filtering, keep original logic
      this.filteredData = this.rawData;
    }
    
    this.updateChartData();
  }

  filterLocationDiffsBySystem(locationDiffs: { [key: string]: number }, systemPrefix: string): { [key: string]: number } {
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

  updateChartData() {
    const sliced = this.dataLimit === -1 ? this.filteredData : this.filteredData.slice(-this.dataLimit);

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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
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
  selector: 'app-link-stability',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './link-stability.component.html',
  styleUrls: ['./link-stability.component.css'],
})
export class LinkStabilityComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Raw data from API (cached)
  allData: SatData[] = [];
  
  // Filtered data for analysis
  filteredData: SatData[] = [];
  
  // Chart configurations
  plotChartData: any;
  tdevChartData: ChartConfiguration["data"] | null = null;
  
  // Chart options
  plotChartOptions: any;
  tdevChartOptions: any;
  
  // Data display limits
  dataLimit = 100;
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

  constructor(
    private satDataService: SatDataService,
    private filterService: FilterService,
    private dateRangeService: DateRangeService,
    private route: ActivatedRoute
  ) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    // Get the data identifier from route data
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'] || '';
    
    // Subscribe to filter changes
    this.filterService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter: string) => {
        this.selectedFilter = filter;
        this.applyFilters();
      });

    // Subscribe to date range changes
    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ start, end }) => {
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
    this.plotChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
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
            text: 'Common View Difference (ns)',
          },
        },
      },
    };

    this.tdevChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
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

  private loadData(): void {
    if (!this.dataIdentifier) {
      this.error = 'No data identifier provided';
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Use the parameters that the SatDataService expects
    this.satDataService.getSatData(0, 1000, 'mjd', 'desc', '', undefined, undefined, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allData = response.content;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading sat data:', err);
          this.error = 'Failed to load satellite data';
          this.isLoading = false;
        }
      });
  }

  private applyFilters(): void {
    let filtered = [...this.allData];

    // Apply satellite filter
    if (this.selectedFilter && this.selectedFilter !== 'ALL') {
      filtered = filtered.filter(item => item.satLetter === this.selectedFilter);
    }

    // Apply date range filter
    if (this.startDate || this.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.mjdDateTime);
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;
        
        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        
        return true;
      });
    }

    // Apply data limit
    if (this.dataLimit > 0) {
      filtered = filtered.slice(-this.dataLimit);
    }

    this.filteredData = filtered;
    this.updatePlotChart();
    
    // Reset TDEV analysis when data changes
    this.showTdevAnalysis = false;
    this.tdevChartData = null;
  }

  private updatePlotChart(): void {
    if (this.filteredData.length === 0) {
      this.plotChartData = null;
      return;
    }

    const labels = this.filteredData.map(item => 
      new Date(item.mjdDateTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const datasetsMap = new Map<string, any>();

    this.filteredData.forEach(item => {
      const key = `${item.source1}-${item.source2}`;
      
      if (!datasetsMap.has(key)) {
        datasetsMap.set(key, {
          label: key,
          data: [],
          borderColor: this.getRandomColor(),
          backgroundColor: 'transparent',
          pointBackgroundColor: [],
          borderWidth: 2,
          tension: 0.1,
        });
      }

      const dataset = datasetsMap.get(key);
      dataset.data.push(item.avgRefsysDifference);
      
      // Color coding: green for ±5ns, yellow for outside
      const color = Math.abs(item.avgRefsysDifference) <= 5 ? 'green' : 'rgb(255, 205, 86)';
      dataset.pointBackgroundColor.push(color);
    });

    this.plotChartData = {
      labels,
      datasets: Array.from(datasetsMap.values()),
    };
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
      // Extract avgRefsysDifference values
      const avgRefsysDifferences = this.filteredData.map(item => item.avgRefsysDifference);

      // Calculate MDEV first
      const mdevData = this.calculateMDEV(avgRefsysDifferences, 960); // 960s = 16 minutes typical interval
      
      // Calculate TDEV from MDEV
      const tdevData = this.calculateTDEV(mdevData);

      console.log('MDEV data:', mdevData);
      console.log('TDEV data:', tdevData);

      // Plot TDEV results
      this.plotTimeDeviation(mdevData, tdevData);
      this.showTdevAnalysis = true;
      
    } catch (error) {
      console.error('Error calculating TDEV:', error);
      this.error = 'Error calculating Time Deviation. Please check the data quality.';
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

    let csvContent = 'Averaging Time (τ),MDEV,TDEV\n';
    
    const labels = this.tdevChartData.labels || [];
    const mdevData = this.tdevChartData.datasets.find(d => d.label?.includes('MDEV'))?.data || [];
    const tdevData = this.tdevChartData.datasets.find(d => d.label?.includes('TDEV'))?.data || [];

    for (let i = 0; i < labels.length; i++) {
      csvContent += `${labels[i]},${mdevData[i] || ''},${tdevData[i] || ''}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Link_Stability_TDEV_${this.dataIdentifier}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPlotCSV(): void {
    if (!this.plotChartData) {
      console.error('No plot data available for download.');
      return;
    }

    let csvContent = 'Time,';
    csvContent += this.plotChartData.datasets.map((d: any) => d.label).join(',') + '\n';

    const labels = this.plotChartData.labels || [];
    
    for (let i = 0; i < labels.length; i++) {
      let row = `"${labels[i]}",`;
      const values = this.plotChartData.datasets.map((dataset: any) => dataset.data[i] || '');
      row += values.join(',');
      csvContent += row + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Link_Stability_Plot_${this.dataIdentifier}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

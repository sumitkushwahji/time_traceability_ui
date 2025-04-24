import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Subscription, interval, switchMap } from 'rxjs';
import { DataCompletenessService } from '../../../../services/data-completeness.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

interface SourceSessionStatus {
  source: string;
  mjd: string;
  currentSessionCount: number;
  expectedSessionCount: number;
}

@Component({
  selector: 'app-data-completeness-dashboard',
  imports: [FormsModule, CommonModule, NgChartsModule],
  templateUrl: './data-completeness-dashboard.component.html',
  styleUrl: './data-completeness-dashboard.component.css',
})
export class DataCompletenessDashboardComponent implements OnInit, OnDestroy {
  data: SourceSessionStatus[] = [];
  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Sessions Completed',
        backgroundColor: '#38a169',
      },
      {
        label: 'Sessions Remaining',
        data: [], // Keep only one 'data' property
        backgroundColor: '#e53e3e',
      },
    ],
  };
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Sessions',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Source',
        },
      },
    },
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: {
        display: true,
        text: `Data Completeness (MJD: '')`,
      },
    },
  };
  selectedMjd: string = '';
  mjdOptions: string[] = [];
  updateIntervalSeconds = 300;
  private updateSubscription: Subscription | undefined;
  private dataCompletenessService: DataCompletenessService;

  constructor(dataCompletenessService: DataCompletenessService) {
    this.dataCompletenessService = dataCompletenessService;
  }

  ngOnInit(): void {
    this.selectedMjd = this.dataCompletenessService.getCurrentMjd();
    this.loadInitialData();
    this.startRealTimeUpdates();
    this.populateMjdOptions();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  loadData(mjd: string): void {
    this.dataCompletenessService
      .getSessionCompleteness(mjd)
      .subscribe((newData) => {
        this.data = newData.filter((item) => item.mjd === mjd);
        this.updateChartData();
        this.chartOptions.plugins!.title!.text = `Data Completeness (MJD: ${mjd})`;
      });
  }

  loadInitialData(): void {
    this.loadData(this.selectedMjd);
  }

  startRealTimeUpdates(): void {
    this.updateSubscription = interval(this.updateIntervalSeconds * 1000)
      .pipe(
        switchMap(() =>
          this.dataCompletenessService.getSessionCompleteness(this.selectedMjd)
        )
      )
      .subscribe((newData) => {
        this.data = newData.filter((item) => item.mjd === this.selectedMjd);
        this.updateChartData();
      });
  }

  updateChartData(): void {
    this.chartData = {
      labels: [...this.data.map((item) => item.source)],
      datasets: [
        {
          label: 'Sessions Completed',
          data: [...this.data.map((item) => item.currentSessionCount)],
          backgroundColor: '#38a169',
        },
        {
          label: 'Sessions Remaining',
          data: [
            ...this.data.map(
              (item) => item.expectedSessionCount - item.currentSessionCount
            ),
          ],
          backgroundColor: '#e53e3e',
        },
      ],
    };
  }

  onMjdChange(): void {
    this.loadData(this.selectedMjd);
  }

  populateMjdOptions(): void {
    this.dataCompletenessService.getAvailableMjds().subscribe(
      (mjds) => {
        this.mjdOptions = mjds;
        if (
          !this.mjdOptions.includes(
            this.dataCompletenessService.getCurrentMjd()
          )
        ) {
          this.mjdOptions.unshift(this.dataCompletenessService.getCurrentMjd());
        }
      },
      (error) => {
        console.error('Error fetching MJD options:', error);
        this.mjdOptions = [this.dataCompletenessService.getCurrentMjd()];
      }
    );
  }
}

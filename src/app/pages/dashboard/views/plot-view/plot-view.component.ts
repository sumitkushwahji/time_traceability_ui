import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../../services/data.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformService } from '../../../../services/platform.service';
import { DateRangeService } from '../../../../services/date-range.service';

@Component({
  selector: 'app-plot-view',
  imports: [FormsModule, CommonModule, NgChartsModule],
  templateUrl: './plot-view.component.html',
  styleUrl: './plot-view.component.css',
})
export class PlotViewComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  fullData: any[] = [];
  filteredData: any[] = [];
  startDate: string = '';
  endDate: string = '';

  isBrowser = false;

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'RefSys Diff',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.3)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: { title: { display: true, text: 'MJD DateTime' } },
      y: { title: { display: true, text: 'RefSys Diff' } },
    },
  };

  constructor(
    private dataService: DataService,
    private platformService: PlatformService,
    private dateRangeService: DateRangeService
  ) {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    this.fullData = this.dataService.getData();
    this.filteredData = [...this.fullData];

    this.updateChart();
    this.dateRangeService.dateRange$.subscribe((range) => {
      this.startDate = range.start;
      this.endDate = range.end;

      // Update chart or filter data
      this.updateChart();
    });
  }

  updateChart(): void {
    const labels = this.filteredData.map((d) =>
      new Date(d.mjdDateTime).toLocaleString()
    );
    const values = this.filteredData.map((d) => d.avgRefsysDifference);

    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0].data = values;
    this.chart?.update();
  }

  applyDateFilter(): void {
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    this.filteredData = this.fullData.filter((d) => {
      const date = new Date(d.mjdDateTime);
      return (!start || date >= start) && (!end || date <= end);
    });

    this.updateChart();
  }

  downloadChart() {
    const base64 = this.chart?.chart?.toBase64Image();
    if (base64) {
      const link = document.createElement('a');
      link.href = base64;
      link.download = 'refsys-diff-chart.png';
      link.click();
    }
  }
}

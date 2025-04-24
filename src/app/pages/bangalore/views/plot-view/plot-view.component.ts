import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DataService } from '../../../../services/data.service';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-plot-view',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './plot-view.component.html',
  styleUrl: './plot-view.component.css',
})
export class PlotViewComponent implements OnInit {
  chartData: ChartData<'line'> = { labels: [], datasets: [] };
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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    const data = this.dataService.getData();

    this.chartData = {
      labels: data.map((d) => new Date(d.mjdDateTime).toLocaleString()),
      datasets: [
        {
          label: 'RefSys Difference',
          data: data.map((d) => d.avgRefsysDifference),
          borderColor: 'blue',
          fill: false,
        },
      ],
    };
  }
}

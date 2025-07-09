import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { SatData2, SatDataService } from '../../../../services/sat-data.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-plot-view',
  imports: [CommonModule, NgChartsModule,FormsModule], 
  templateUrl: './plot-view.component.html',
  styleUrl: './plot-view.component.css',
})
export class PlotViewComponent implements OnInit {
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

  constructor(private dataService: SatDataService) {}

  ngOnInit(): void {
    this.dataService.getPivotedSatDataForPlot().subscribe((data) => {
      this.rawData = data;
      this.updateChartData();
    });
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
    const color = this.getRandomColor();  // Generate one color for this dataset

    return {
      label: loc,
      data: data.map(d => d.locationDiffs[loc] ?? null),
      borderColor: color,               // Line color
      backgroundColor: color,           // Point fill color
      pointBorderColor: color,          // Point border
      pointBackgroundColor: color,      // Point fill
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

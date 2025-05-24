import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { SatData2, SatDataService } from '../../../../services/sat-data.service';



@Component({
  selector: 'app-plot-view',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './plot-view.component.html',
  styleUrl: './plot-view.component.css',
})
export class PlotViewComponent implements OnInit {
  data: SatData2[] = [];
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

  constructor(private dataService: SatDataService) {}

  ngOnInit(): void {
    this.dataService.getPivotedSatDataForPlot().subscribe((data) => {
      this.data = data;

      this.chartData = {
        labels: this.data.map(d => new Date(d.mjdDateTime).toLocaleString()),
        datasets: this.buildDatasets(this.data),
      };
    });
  }

  buildDatasets(data: SatData2[]) {
    const locations = new Set<string>();
    data.forEach(d => {
      Object.keys(d.locationDiffs).forEach(loc => locations.add(loc));
    });

    return Array.from(locations).map(loc => ({
      label: loc,
      data: data.map(d => d.locationDiffs[loc] ?? null),
      fill: false,
      borderColor: this.getRandomColor(),
    }));
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for(let i=0; i<6; i++) {
      color += letters[Math.floor(Math.random()*16)];
    }
    return color;
  }
}

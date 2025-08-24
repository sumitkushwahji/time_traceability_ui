import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { SatDataService, SatData } from '../../../services/sat-data.service';
import { FilterService } from '../../../services/filter.service';
import { DateRangeService } from '../../../services/date-range.service';
import { DataService } from '../../../services/data.service';
import { PlatformService } from '../../../services/platform.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-paginated-plot-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './paginated-plot-view.component.html',
  styleUrls: ['./paginated-plot-view.component.css'],
})
export class PaginatedPlotViewComponent implements OnInit, OnDestroy {
  data: SatData[] = [];
  dataLimit = 50;
  dataLimits = [25, 50, 100, -1];
  chartData: any;
  chartOptions: any;
  isBrowser!: boolean;

  startDate = '';
  endDate = '';
  selectedFilter = 'ALL';
  searchQuery = '';
  dataIdentifier?: string;

  private destroy$ = new Subject<void>();

  readonly locationSource2Map: { [key: string]: string[] } = {
    npl: ['GZLI2P', 'IRNPLI'],
    bangalore: ['GZLMB1', 'GZLMB2', 'IRLMB2', 'IRLMB1'],
    faridabad: ['GZLMF1', 'GZLMF2', 'IRACCO'],
    ahmedabad: ['GZLAHM1', 'IRAHM1', 'GZLMA2'], // Added GZLMA2 for Ahmedabad data
    bhubaneshwar: ['GZLBBS1', 'IRBBS1'],
    drc: ['GZLDEL1', 'IRDEL1'],
    guwahati: ['GZLGHT1', 'IRGHT1'],
  };

  constructor(
    private route: ActivatedRoute,
    private satDataService: SatDataService,
    private filterService: FilterService,
    private dateRangeService: DateRangeService,
    private dataService: DataService,
    private platformService: PlatformService
  ) {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    this.dataIdentifier = this.route.snapshot.data['dataIdentifier'];

    this.filterService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter) => {
        this.selectedFilter = filter;
        this.fetchAndUpdateChart();
      });

    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((range) => {
        this.startDate = range.start;
        this.endDate = range.end;
        this.fetchAndUpdateChart();
      });

    this.dataService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.data = data;
        this.updateChartData();
      });

    // Initial data fetch
    this.fetchAndUpdateChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchAndUpdateChart(): void {
    const source2 = this.dataIdentifier
      ? this.locationSource2Map[this.dataIdentifier] ?? null
      : null;
    
    // Handle system-level filtering (GPS, NavIC, GLONASS) for plot view
    let satLetter: string | null = null;
    if (this.selectedFilter === 'ALL') {
      satLetter = null; // Show all satellites
    } else if (['GPS', 'NAVIC', 'GLONASS'].includes(this.selectedFilter)) {
      satLetter = null; // Let all data come through, filter client-side later
    } else {
      satLetter = this.selectedFilter; // Specific satellite letter
    }

    const search = this.searchQuery.trim();

    const fetch$ = source2
      ? this.satDataService.getPaginatedSatDataBySource2(
          source2,
          0, // first page
          500, // enough data for plotting
          'mjd',
          'asc',
          search,
          this.startDate,
          this.endDate,
          satLetter
        )
      : this.satDataService.getSatData(
          0,
          500,
          'mjd',
          'asc',
          search,
          this.startDate,
          this.endDate,
          satLetter
        );

    fetch$.subscribe((response) => {
      let filteredData = response.content;
      
      // Apply client-side filtering for system-level filters
      if (this.selectedFilter === 'GPS') {
        filteredData = response.content.filter(
          (row) => row.satLetter?.toUpperCase().startsWith('G')
        );
      } else if (this.selectedFilter === 'NAVIC') {
        filteredData = response.content.filter(
          (row) => row.satLetter?.toUpperCase().startsWith('IR')
        );
      } else if (this.selectedFilter === 'GLONASS') {
        filteredData = response.content.filter(
          (row) => row.satLetter?.toUpperCase().startsWith('R')
        );
      }
      
      this.data = filteredData;
      this.updateChartData();
    });
  }

  updateChartData(): void {
    const sliced = this.dataLimit === -1 ? this.data : this.data.slice(-this.dataLimit);

    this.chartData = {
      labels: sliced.map((d) => d.mjdDateTime),
      datasets: [
        {
          label: 'Avg1',
          data: sliced.map((d) => d.avg1),
          borderColor: 'blue',
          tension: 0.3,
        },
        {
          label: 'Avg2',
          data: sliced.map((d) => d.avg2),
          borderColor: 'green',
          tension: 0.3,
        },
        {
          label: 'CV Diff',
          data: sliced.map((d) => d.avgRefsysDifference),
          borderColor: 'red',
          tension: 0.3,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Satellite Averages Over Time',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'MJD DateTime',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Values',
          },
        },
      },
    };
  }
}

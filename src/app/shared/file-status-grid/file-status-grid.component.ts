import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileStatus, SatDataService } from '../../services/sat-data.service';


interface Location {
  displayName: string;
  sourceName: string;
}

interface StatusDisplay {
  text: string;
  timestamp?: string;
  cssClass: string;
}

@Component({
  selector: 'app-file-status-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-status-grid.component.html',
  styleUrls: ['./file-status-grid.component.css']
})
export class FileStatusGridComponent implements OnInit {
  @Input() system: 'GPS' | 'NavIC' = 'NavIC';

  isLoading = false;
  displayedDates: Date[] = [];
  statusMap: Map<string, FileStatus> = new Map();
  
  locations: Location[] = [];
  
  private baseDate = new Date();
  private mjdEpoch = new Date('1858-11-17T00:00:00Z');

  // Define location mappings
  private readonly locationMap = {
    NavIC: [
        { displayName: 'Bangalore RX1', sourceName: 'IRLMB1' },
        { displayName: 'Bangalore RX2', sourceName: 'IRLMB2' },
        { displayName: 'Faridabad Rx1', sourceName: 'IRLMF1' },
        { displayName: 'Faridabad Rx2', sourceName: 'IRLMF2' },
        { displayName: 'Ahmadabad Rx1', sourceName: 'IRLMA1' },
        { displayName: 'Ahmadabad Rx2', sourceName: 'IRLMA2' },
        // ... add all other NavIC locations here
    ],
    GPS: [
        { displayName: 'Bangalore RX1', sourceName: 'GZLMB1' },
        { displayName: 'Bangalore RX2', sourceName: 'GZLMB2' },
        { displayName: 'Faridabad Rx1', sourceName: 'GZLMF1' },
        { displayName: 'Faridabad Rx2', sourceName: 'GZLMF2' },
        // ... add all other GPS locations here
    ]
  };

  constructor(private satDataService: SatDataService) {}

  ngOnInit(): void {
    this.locations = this.locationMap[this.system];
    this.goToLatestDays();
  }

  fetchStatuses(): void {
    this.isLoading = true;
    const sources = this.locations.map(loc => loc.sourceName);
    const startDate = this.formatDate(this.displayedDates[this.displayedDates.length - 1]);
    const endDate = this.formatDate(this.displayedDates[0]);

    this.satDataService.getFileStatuses(sources, startDate, endDate).subscribe(data => {
      this.statusMap.clear();
      data.forEach(status => {
        this.statusMap.set(`${status.source}-${status.mjd}`, status);
      });
      this.isLoading = false;
    });
  }
  
  updateDateRange(): void {
    this.displayedDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.baseDate);
      date.setDate(date.getDate() - i);
      this.displayedDates.push(date);
    }
    this.fetchStatuses();
  }

  navigateDays(offset: number): void {
    this.baseDate.setDate(this.baseDate.getDate() + offset);
    this.updateDateRange();
  }

  goToLatestDays(): void {
    this.baseDate = new Date();
    this.updateDateRange();
  }
  
  getDisplayData(location: Location, date: Date): StatusDisplay {
    const mjd = this.dateToMjd(date);
    const key = `${location.sourceName}-${mjd}`;
    const status = this.statusMap.get(key);
    
    const todayMjd = this.dateToMjd(new Date());
    
    if (status?.status === 'AVAILABLE') {
        const time = new Date(status.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        return { text: time, cssClass: 'bg-green-200 text-green-800' };
    }
    
    if (mjd === todayMjd) {
        return { text: 'Waiting', cssClass: 'bg-yellow-200 text-yellow-800 animate-pulse' };
    }

    if (mjd < todayMjd) {
        return { text: '', cssClass: 'bg-red-200' };
    }
    
    // For future dates
    return { text: '-', cssClass: 'bg-gray-100 text-gray-400' };
  }
  
  private dateToMjd(date: Date): number {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return Math.floor((utcDate.getTime() - this.mjdEpoch.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

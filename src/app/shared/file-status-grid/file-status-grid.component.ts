import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileStatus, SatDataService } from '../../services/sat-data.service';
import { getReceiverDisplayName } from '../receiver-display-name.map';


interface Location {
  displayName: string;
  sourceName: string;
  systemType?: 'GPS' | 'NavIC'; // Add system type for grouping
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
  @Input() system: 'GPS' | 'NavIC' | 'Both' = 'NavIC';

  isLoading = false;
  displayedDates: Date[] = [];
  statusMap: Map<string, FileStatus> = new Map();
  
  locations: Location[] = [];
  
  private baseDate = new Date();
  private mjdEpoch = new Date('1858-11-17T00:00:00Z');

  // System options for toggle
  systemOptions: ('GPS' | 'NavIC' | 'Both')[] = ['NavIC', 'GPS', 'Both'];

  // Define receiver codes for each system
  private readonly receiverCodes = {
    NavIC: [
      'IRNPLI', 'IRLMB1', 'IRLMB2', 'IRLMA1', 'IRLMA2', 
      'IRLMF1', 'IRLMF2', 'IRLMO1', 'IRLMO2', 'IRLMG1', 
      'IRLMG2', 'IRDRC1', 'IRDRC2'
    ],
    GPS: [
      'GZLI2P', 'GZLMB1', 'GZLMB2', 'GZLMA1', 'GZLMA2',
      'GZLMF1', 'GZLMF2', 'GZLMO1', 'GZLMO2', 'GZLMG1',
      'GZLMG2', 'GZDRC1', 'GZDRC2'
    ]
  };

  constructor(private satDataService: SatDataService) {}

  ngOnInit(): void {
    this.updateLocations();
    this.goToLatestDays();
  }

  updateLocations(): void {
    // Generate locations dynamically using the receiver display name mapping
    if (this.system === 'Both') {
      const navicLocations = this.receiverCodes.NavIC.map((code: string) => ({
        displayName: getReceiverDisplayName(code),
        sourceName: code,
        systemType: 'NavIC' as const
      }));
      const gpsLocations = this.receiverCodes.GPS.map((code: string) => ({
        displayName: getReceiverDisplayName(code),
        sourceName: code,
        systemType: 'GPS' as const
      }));
      // Group NavIC first, then GPS
      this.locations = [...navicLocations, ...gpsLocations];
    } else {
      this.locations = this.receiverCodes[this.system].map((code: string) => ({
        displayName: getReceiverDisplayName(code),
        sourceName: code,
        systemType: this.system as 'GPS' | 'NavIC'
      }));
    }
  }

  onSystemChange(newSystem: 'GPS' | 'NavIC' | 'Both'): void {
    this.system = newSystem;
    this.updateLocations();
    this.fetchStatuses();
  }

  // Helper method to group locations by system type for display
  getGroupedLocations(): { systemType: string; locations: Location[] }[] {
    if (this.system !== 'Both') {
      return [{ systemType: this.system, locations: this.locations }];
    }
    
    const grouped = this.locations.reduce((acc, location) => {
      const systemType = location.systemType || 'Unknown';
      if (!acc[systemType]) {
        acc[systemType] = [];
      }
      acc[systemType].push(location);
      return acc;
    }, {} as { [key: string]: Location[] });

    // Return in specific order: NavIC first, then GPS
    const orderedSystems = ['NavIC', 'GPS'];
    return orderedSystems
      .filter(system => grouped[system])
      .map(systemType => ({
        systemType,
        locations: grouped[systemType]
      }));
  }

  // Helper method to get total location count for display
  getTotalLocationCount(): number {
    return this.locations.length;
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
  
  private readonly timeFormat: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  };

  private formatDateTime(date: Date): string {
    return date.toLocaleTimeString('en-IN', this.timeFormat);
  }

  getDisplayData(location: Location, date: Date): StatusDisplay {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const mjd = this.dateToMjd(date);
    const key = `${location.sourceName}-${mjd}`;
    const status = this.statusMap.get(key);
    
    // Handle existing files
    if (status?.status === 'AVAILABLE' && status.fileCreationTime) {
      try {
        const creationTime = new Date(status.fileCreationTime);
        
        if (!isNaN(creationTime.getTime())) {
          const timeStr = this.formatDateTime(creationTime);
          
          // For today's date, check if it's before expected time
          if (dateStart.getTime() === todayStart.getTime()) {
            const expectedHour = this.getExpectedHourForLocation(location);
            const currentHour = creationTime.getHours();
            
            if (currentHour < expectedHour) {
              return { 
                text: 'Waiting', 
                timestamp: `Expected at ${expectedHour}:00`,
                cssClass: 'bg-yellow-200 text-yellow-800 animate-pulse' 
              };
            }
          }
          
          return {
            text: timeStr,
            timestamp: `File Time: ${timeStr}`,
            cssClass: 'bg-green-200 text-green-800'
          };
        }
      } catch (error) {
        console.error('Error parsing dates:', error);
      }
    }
    
    // Handle today's files that haven't arrived yet
    if (dateStart.getTime() === todayStart.getTime()) {
      const expectedHour = this.getExpectedHourForLocation(location);
      return { 
        text: 'Waiting', 
        timestamp: `Expected at ${expectedHour}:00`,
        cssClass: 'bg-yellow-200 text-yellow-800 animate-pulse' 
      };
    }
    
    // Handle missing past files
    if (dateStart < todayStart) {
      return { text: '', cssClass: 'bg-red-200' };
    }
    
    // Handle future dates
    return { text: '-', cssClass: 'bg-gray-100 text-gray-400' };
  }

  private getExpectedHourForLocation(location: Location): number {
    // Set expected hours based on location
    if (location.sourceName.startsWith('IRNPLI')) {
      return 5; // Expected at 5 AM
    } else if (location.sourceName.startsWith('GZLI2P')) {
      return 5; // Expected at 5 AM
    }
    return 5; // Default expected time
  }

  private dateToMjd(date: Date): number {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return Math.floor((utcDate.getTime() - this.mjdEpoch.getTime()) / (1000 * 60 * 60 * 24));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

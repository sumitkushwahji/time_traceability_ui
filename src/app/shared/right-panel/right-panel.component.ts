import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-right-panel',
  imports: [CommonModule],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.css',
})
export class RightPanelComponent {
  @Input() location: string = '';
  @Output() linkClick = new EventEmitter<string>();

  links: string[] = [];

  ngOnChanges() {
    const linkMap: { [key: string]: string[] } = {
      dashboard: ['NavIC Link', 'GPS Link', 'Glonass Link'],
      ahmedabad: ['NavIC Link', 'GPS Link', 'Glonass Link', 'All Links'],
      guwahati: ['NavIC Link', 'GPS Link', 'Glonass Link', 'All Links'],
      bangalore: ['NavIC Link', 'GPS Link', 'Glonass Link', 'All Links'],
      faridabad: ['NavIC Link', 'GPS Link', 'Glonass Link', 'All Links'],
      bhubaneshwar: ['NavIC Link', 'GPS Link', 'Glonass Link', 'All Links'],
      drc: ['NavIC Link', 'GPS Link', 'Glonass Link', 'All Links'],
    };
    this.links = linkMap[this.location] || [];
  }
}

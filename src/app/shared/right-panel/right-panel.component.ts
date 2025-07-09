
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.css',
})
export class RightPanelComponent {
  @Input() location: string = '';
  @Output() linkClick = new EventEmitter<string>();

  links: string[] = [];
  selectedLink: string = '';

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
    this.selectedLink = ''; // reset on location change
  }

  getLinkClass(link: string): string {
    const base =
      'w-full px-4 py-2 rounded text-left font-medium transition-colors duration-300';

    const colorMap: { [key: string]: string } = {
      dashboard: 'text-blue-800 hover:bg-blue-200',
      ahmedabad: 'text-teal-800 hover:bg-teal-200',
      bangalore: 'text-green-800 hover:bg-green-200',
      bhubaneshwar: 'text-yellow-800 hover:bg-yellow-200',
      faridabad: 'text-orange-800 hover:bg-orange-200',
      guwahati: 'text-purple-800 hover:bg-purple-200',
      drc: 'text-pink-800 hover:bg-pink-200',
    };

    const selectedColorMap: { [key: string]: string } = {
      dashboard: 'bg-blue-200 font-bold',
      ahmedabad: 'bg-teal-200 font-bold',
      bangalore: 'bg-green-200 font-bold',
      bhubaneshwar: 'bg-yellow-200 font-bold',
      faridabad: 'bg-orange-200 font-bold',
      guwahati: 'bg-purple-200 font-bold',
      drc: 'bg-pink-200 font-bold',
    };

    const isSelected = link === this.selectedLink;
    const colorClass = isSelected
      ? selectedColorMap[this.location]
      : colorMap[this.location];

    return `${base} ${colorClass}`;
  }

  // onLinkClick(link: string) {
  //   this.selectedLink = link;
  //   const formatted = link.toLowerCase().replace(/ /g, '-');
  //   this.linkClick.emit(formatted);
  // }

  onLinkClick(link: string) {
  this.selectedLink = link;

  const linkToFilterMap: { [key: string]: string } = {
    'NavIC Link': 'NAVIC',
    'GPS Link': 'GPS',
    'Glonass Link': 'GLONASS',
    'All Links': 'ALL'
  };

  const filter = linkToFilterMap[link] || 'ALL';
  this.linkClick.emit(filter); // Emits 'N', 'G', 'R', or 'ALL'
}
}

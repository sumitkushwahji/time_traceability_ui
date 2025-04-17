
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-top-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-buttons.component.html',
  styleUrl: './top-buttons.component.css',
})
export class TopButtonsComponent {
  @Input() location: string = '';
  @Output() buttonClick = new EventEmitter<string>();

  buttons: string[] = [];

  ngOnChanges() {
    const buttonMap: { [key: string]: string[] } = {
      dashboard: ['Start date', 'End date', 'Data View', 'Plot View'],
      ahmedabad: ['Start date', 'End date', 'Data View', 'Plot View', 'Link Stats'],
      bangalore: ['Start date', 'End date', 'Data View', 'Plot View', 'Link Stats'],
      faridabad: ['Start date', 'End date', 'Data View', 'Plot View', 'Link Stats'],
      bhubaneshwar: ['Start date', 'End date', 'Data View', 'Plot View', 'Link Stats'],
      guwahati: ['Start date', 'End date', 'Data View', 'Plot View', 'Link Stats'],
      drc: ['Start date', 'End date', 'Data View', 'Plot View', 'Link Stats'],
    };
    this.buttons = buttonMap[this.location] || [];
  }

  getButtonClass(location: string): string {
    const colorMap: { [key: string]: string } = {
      dashboard: 'bg-blue-200 text-blue-800 hover:bg-blue-300',
      ahmedabad: 'bg-teal-200 text-teal-800 hover:bg-teal-300',
      bangalore: 'bg-green-200 text-green-800 hover:bg-green-300',
      bhubaneshwar: 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300',
      faridabad: 'bg-orange-200 text-orange-800 hover:bg-orange-300',
      guwahati: 'bg-purple-200 text-purple-800 hover:bg-purple-300',
      drc: 'bg-pink-200 text-pink-800 hover:bg-pink-300',
    };
    return colorMap[location] || 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  }

  onClick(btn: string) {
    const formatted = btn.toLowerCase().replace(/ /g, '-'); // handles spaces like "Link Stats" -> "link-stats"
    this.buttonClick.emit(formatted);
  }
}

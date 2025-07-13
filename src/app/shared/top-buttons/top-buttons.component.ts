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
  @Input() selectedView: string = '';

  @Output() buttonClick = new EventEmitter<string>();

  buttons: string[] = [];

  ngOnChanges() {
    const buttonMap: { [key: string]: string[] } = {
      dashboard: ['Data View', 'Plot View', 'Link Stats'],
      ahmedabad: ['Data View', 'Plot View', 'Link stability'],
      bangalore: ['Data View', 'Plot View', 'Link stability'],
      faridabad: ['Data View', 'Plot View', 'Link stability'],
      bhubaneshwar: ['Data View', 'Plot View', 'Link stability'],
      guwahati: ['Data View', 'Plot View', 'Link stability'],
      drc: ['Data View', 'Plot View', 'Link stability'],
    };
    this.buttons = buttonMap[this.location] || [];
  }

getButtonClass(button: string): string {
  const base = 'px-4 py-2 rounded font-medium transition-colors duration-300';

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

  const isSelected = this.selectedView === button.toLowerCase().replace(/ /g, '-');
  const color = isSelected
    ? selectedColorMap[this.location]
    : colorMap[this.location];

  return `${base} ${color}`;
}


  onClick(btn: string) {
    const formatted = btn.toLowerCase().replace(/ /g, '-'); // handles spaces like "Link Stats" -> "link-stats"
    this.buttonClick.emit(formatted);
  }
}

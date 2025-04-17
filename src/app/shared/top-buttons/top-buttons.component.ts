import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-top-buttons',
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
      dashboard: [
        'Start date',
        'End date',
        'Data View',
        'Plot View',
        'Link Stats',
      ],
      ahmedabad: [
        'Start date',
        'End date',
        'Time Difference',
        'Link stability',
      ],
      bangalore: [
        'Start date',
        'End date',
        'Time Difference',
        'Link stability',
      ],
      faridabad: [
        'Start date',
        'End date',
        'Time Difference',
        'Link stability',
      ],
      bhubaneshwar: [
        'Start date',
        'End date',
        'Time Difference',
        'Link stability',
      ],
      guwahati: ['Start date', 'End date', 'Time Difference', 'Link stability'],
      drc: ['Start date', 'End date', 'Time Difference', 'Link stability'],
    };
    this.buttons = buttonMap[this.location] || [];
  }

  onClick(btn: string) {
    const formatted = btn.toLowerCase().replace(' ', '-'); // 'Plot View' -> 'plot-view'
    this.buttonClick.emit(formatted);
  }
}

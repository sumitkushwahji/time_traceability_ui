import { Component } from '@angular/core';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bhubaneshwar',
  imports: [
    TopButtonsComponent,
    RightPanelComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './bhubaneshwar.component.html',
  styleUrl: './bhubaneshwar.component.css',
})
export class BhubaneshwarComponent {
  locationName = 'bhubaneshwar';
}

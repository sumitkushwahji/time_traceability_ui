import { Component } from '@angular/core';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faridabad',
  imports: [
    TopButtonsComponent,
    RightPanelComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './faridabad.component.html',
  styleUrl: './faridabad.component.css',
})
export class FaridabadComponent {
  locationName = 'faridabad';
}

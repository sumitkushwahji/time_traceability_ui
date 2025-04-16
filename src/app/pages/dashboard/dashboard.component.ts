import { Component } from '@angular/core';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';

@Component({
  selector: 'app-dashboard',
  imports: [TopButtonsComponent, RightPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  location = 'dashboard';
}

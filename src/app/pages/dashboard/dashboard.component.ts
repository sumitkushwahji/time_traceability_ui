import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TopButtonsComponent,
    RightPanelComponent,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  location = 'dashboard';
  selectedView: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  onTopButtonClicked(view: string) {
    this.selectedView = view; // Store the selected view

    // Navigate to child route like 'data-view' or 'plot-view'
    this.router.navigate([view], { relativeTo: this.route });
  }
}

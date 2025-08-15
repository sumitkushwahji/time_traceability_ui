import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FilterService } from '../../services/filter.service';

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
export class DashboardComponent implements OnInit {
  location = 'dashboard';
  selectedView: string = '';
  
  selectedFilter: string = 'GPS'; // Default to GPS

  constructor(private router: Router, private route: ActivatedRoute, private filterService: FilterService) {
    // Ensure filter service has the correct initial value
    this.filterService.setFilter(this.selectedFilter);
  }

  ngOnInit(): void {
    // Initialize selectedView based on the current child route
    this.route.firstChild?.url.subscribe((urlSegments) => {
      if (urlSegments.length > 0) {
        this.selectedView = urlSegments[0].path;
      } else {
        // Default to 'plot-view' if no child route is active (matches the default redirect)
        this.selectedView = 'plot-view';
      }
    });

    // If no child route is initially active, set the default
    if (!this.selectedView) {
      this.selectedView = 'plot-view';
    }
  }

  onTopButtonClicked(view: string) {
    this.selectedView = view; // Store the selected view

    // Navigate to child route like 'data-view' or 'plot-view'
    this.router.navigate([view], { relativeTo: this.route });
  }

  onRightPanelFilter(filter: string) {
    this.selectedFilter = filter; // Update local state
    this.filterService.setFilter(filter); // Update service state
  }
}

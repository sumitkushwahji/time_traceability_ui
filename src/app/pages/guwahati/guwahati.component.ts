import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-guwahati',
  imports: [
    RightPanelComponent,
    TopButtonsComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './guwahati.component.html',
  styleUrl: './guwahati.component.css',
})
export class GuwahatiComponent {
  locationName = 'guwahati';
   selectedView: string = ''; // To track which top button is active
     selectedFilter: string = 'ALL'; // To track the current right-panel filter
   
     constructor(
       private router: Router,
       private route: ActivatedRoute,
       private filterService: FilterService // Inject FilterService
     ) {
       console.log(
         `${this.locationName}Component: Constructor called. Initial selectedFilter: ${this.selectedFilter}`
       );
     }
   
     // This ngOnInit method is crucial for setting the initial state
     ngOnInit(): void {
       // 1. Initialize the FilterService with the default filter for this location.
       // This ensures that PaginatedDataViewComponent and PlotViewComponent
       // receive the correct filter value from the start.
       console.log(
         `${this.locationName}Component: ngOnInit called. Setting initial filter to FilterService: ${this.selectedFilter}`
       );
       this.filterService.setFilter(this.selectedFilter);
   
       // 2. Initialize selectedView based on the current child route.
       // This helps in highlighting the correct top button if the user lands directly on a child route.
       this.route.firstChild?.url.subscribe((urlSegments) => {
         if (urlSegments.length > 0) {
           this.selectedView = urlSegments[0].path;
         } else {
           // Default to 'data-view' if no child route is active (e.g., on '/bangalore')
           this.selectedView = 'data-view';
         }
       });
     }
   
     // Method to handle clicks from the TopButtonsComponent
     onTopButtonClicked(view: string) {
       this.selectedView = view; // Update the active view
       console.log(
         `${this.locationName}Component: onTopButtonClicked called with view: ${view}`
       );
       // Navigate to child route like 'data-view', 'plot-view', or 'link-stability'
       this.router.navigate([view], { relativeTo: this.route });
     }
   
     // Method to handle filter changes from the RightPanelComponent
     onRightPanelFilter(filter: string) {
       console.log(
         `${this.locationName}Component: onRightPanelFilter called with filter from RightPanel: ${filter}`
       );
       this.selectedFilter = filter; // Update the component's filter state
       console.log(
         `${this.locationName}Component: Updating FilterService with: ${filter}`
       );
       this.filterService.setFilter(filter); // Propagate the filter change via FilterService
     }

}

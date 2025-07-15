import { Component } from '@angular/core';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
   selectedView: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  onTopButtonClicked(view: string) {
    this.selectedView = view; // Store the selected view

    // Navigate to child route like 'data-view' or 'plot-view'
    this.router.navigate([view], { relativeTo: this.route });
  }
}

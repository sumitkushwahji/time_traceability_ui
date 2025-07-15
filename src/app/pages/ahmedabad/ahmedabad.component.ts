import { Component } from '@angular/core';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-ahmedabad',
  imports: [
    RightPanelComponent,
    TopButtonsComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './ahmedabad.component.html',
  styleUrl: './ahmedabad.component.css',
})
export class AhmedabadComponent {
  locationName = 'ahmedabad';
   selectedView: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  onTopButtonClicked(view: string) {
    this.selectedView = view; // Store the selected view

    // Navigate to child route like 'data-view' or 'plot-view'
    this.router.navigate([view], { relativeTo: this.route });
  }
}

import { Component } from '@angular/core';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
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

  selectedView: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  onTopButtonClicked(view: string) {
    this.selectedView = view; // Store the selected view

    // Navigate to child route like 'data-view' or 'plot-view'
    this.router.navigate([view], { relativeTo: this.route });
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';

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
}

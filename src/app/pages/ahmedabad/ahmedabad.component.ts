import { Component } from '@angular/core';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
}

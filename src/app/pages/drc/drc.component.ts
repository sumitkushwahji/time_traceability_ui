import { Component } from '@angular/core';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-drc',
  imports: [
    RightPanelComponent,
    TopButtonsComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './drc.component.html',
  styleUrl: './drc.component.css',
})
export class DrcComponent {
  locationName = 'drc';
}

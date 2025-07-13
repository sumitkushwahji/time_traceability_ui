import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BhubaneshwarRoutingModule } from './bhubaneshwar-routing.module';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { SharedViewsModule } from '../../shared/views/shared-views.module'; // Import SharedViewsModule

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BhubaneshwarRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
    SharedViewsModule, // Add SharedViewsModule to imports
  ],
})
export class BhubaneshwarModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DrcRoutingModule } from './drc-routing.module';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { SharedViewsModule } from '../../shared/views/shared-views.module'; // Import SharedViewsModule

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DrcRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
    SharedViewsModule, // Add SharedViewsModule to imports
  ],
})
export class DrcModule {}

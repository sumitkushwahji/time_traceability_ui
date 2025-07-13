import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AhmedabadRoutingModule } from './ahmedabad-routing.module';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { AhmedabadComponent } from './ahmedabad.component';
import { SharedViewsModule } from '../../shared/views/shared-views.module'; // Import SharedViewsModule

@NgModule({
  declarations: [], // AhmedabadComponent is standalone, so it's imported, not declared.
  imports: [
    CommonModule,
    AhmedabadRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
    AhmedabadComponent, // Assuming AhmedabadComponent is standalone and imported here
    SharedViewsModule, // Add SharedViewsModule to imports
  ],
})
export class AhmedabadModule {}

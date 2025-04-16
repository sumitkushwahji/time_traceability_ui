import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AhmedabadRoutingModule } from './ahmedabad-routing.module';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';

import { AhmedabadComponent } from './ahmedabad.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AhmedabadRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
    AhmedabadComponent,
  ],
})
export class AhmedabadModule {}

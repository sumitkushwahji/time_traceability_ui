import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BhubaneshwarRoutingModule } from './bhubaneshwar-routing.module';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BhubaneshwarRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
  ],
})
export class BhubaneshwarModule {}

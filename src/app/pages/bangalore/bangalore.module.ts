import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BangaloreRoutingModule } from './bangalore-routing.module';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BangaloreRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
  ],
})
export class BangaloreModule {}

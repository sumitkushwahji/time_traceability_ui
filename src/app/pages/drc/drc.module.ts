import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DrcRoutingModule } from './drc-routing.module';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DrcRoutingModule,
    RouterModule,
    TopButtonsComponent,
    RightPanelComponent,
  ],
})
export class DrcModule {}

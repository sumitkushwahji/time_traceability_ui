import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuwahatiRoutingModule } from './guwahati-routing.module';
import { RouterModule } from '@angular/router';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { TopButtonsComponent } from '../../shared/top-buttons/top-buttons.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GuwahatiRoutingModule,
     RouterModule,
        TopButtonsComponent,
        RightPanelComponent,
  ]
})
export class GuwahatiModule { }

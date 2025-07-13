// dashboard.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { SharedViewsModule } from '../../shared/views/shared-views.module'; // Import the SharedViewsModule

@NgModule({
  // No need to declare DataViewComponent here anymore as it's provided by SharedViewsModule
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HttpClientModule,
    NgChartsModule,
    SharedViewsModule, // Add SharedViewsModule to the imports array
  ],
})
export class DashboardModule {}

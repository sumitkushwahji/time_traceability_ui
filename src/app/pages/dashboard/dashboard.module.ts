// dashboard.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgChartsModule } from 'ng2-charts'; // ✅ Add this

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HttpClientModule,
    NgChartsModule, // ✅ Add this to the imports array
  ],
})
export class DashboardModule {}

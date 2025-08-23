import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics.component';
import { SharedViewsModule } from '../../shared/views/shared-views.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
    StatisticsComponent,
    SharedViewsModule
  ]
})
export class StatisticsModule { }

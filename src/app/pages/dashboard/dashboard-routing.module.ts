import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DataViewComponent } from '../../shared/views/data-view/data-view.component'; // Corrected import path
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component'; // Corrected import path
import { DataCompletenessDashboardComponent } from './views/data-completeness-dashboard/data-completeness-dashboard.component';
import { FileAvailabilityComponent } from './views/file-availability/file-availability.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'plot-view', pathMatch: 'full' },
      // Use the shared DataViewComponent, specifying dataType 'all'
      { path: 'data-view', component: DataViewComponent, data: { dataType: 'all' } },
      // Use the shared PlotViewComponent, specifying dataType 'all'
      { path: 'plot-view', component: PlotViewComponent, data: { dataType: 'all' } },
      {
        path: 'link-stats',
        component: DataCompletenessDashboardComponent,
      },
      {
        path: 'file-availability',
        component: FileAvailabilityComponent,
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

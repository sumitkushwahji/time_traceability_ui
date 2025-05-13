import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DataViewComponent } from './views/data-view/data-view.component';
import { PlotViewComponent } from './views/plot-view/plot-view.component';
import { DataCompletenessDashboardComponent } from './views/data-completeness-dashboard/data-completeness-dashboard.component';
import { FileAvailabilityComponent } from './views/file-availability/file-availability.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      { path: 'data-view', component: DataViewComponent },
      { path: 'plot-view', component: PlotViewComponent },
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

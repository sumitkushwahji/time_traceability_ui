import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
// Home page uses the original components with their own API calls
import { DataViewComponent } from '../../shared/views/data-view/data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';
import { DataCompletenessDashboardComponent } from './views/data-completeness-dashboard/data-completeness-dashboard.component';
import { FileAvailabilityComponent } from './views/file-availability/file-availability.component';
import { authGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['APP-USER'] },
    children: [
      { path: '', redirectTo: 'plot-view', pathMatch: 'full' },
      // Home page uses original DataViewComponent with its own API calls
      { path: 'data-view', component: DataViewComponent },
      // Home page uses original PlotViewComponent with its own API calls
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

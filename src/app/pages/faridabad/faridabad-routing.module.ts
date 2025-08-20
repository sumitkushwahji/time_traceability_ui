import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaridabadComponent } from './faridabad.component';
// Import the fast shared components for better performance
import { FastDataViewComponent } from '../../shared/views/fast-data-view/fast-data-view.component';
import { FastPlotViewComponent } from '../../shared/views/fast-plot-view/fast-plot-view.component';
import { LinkStabilityComponent } from '../../shared/views/link-stability/link-stability.component';

const routes: Routes = [
  {
    path: '',
    component: FaridabadComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the fast FastDataViewComponent for Faridabad's data view
      {
        path: 'data-view',
        component: FastDataViewComponent,
        data: { dataIdentifier: 'faridabad' }, // Pass 'faridabad' as identifier
      },
      // Use the fast FastPlotViewComponent for Faridabad's plot view
      {
        path: 'plot-view',
        component: FastPlotViewComponent,
        data: { dataIdentifier: 'faridabad' }, // Pass 'faridabad' as identifier
      },
      // Use the LinkStabilityComponent for Faridabad's link stability analysis
      {
        path: 'link-stability',
        component: LinkStabilityComponent,
        data: { dataIdentifier: 'faridabad' }, // Pass 'faridabad' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaridabadRoutingModule {}

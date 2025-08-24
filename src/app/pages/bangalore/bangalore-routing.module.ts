import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BangaloreComponent } from './bangalore.component';
// Import the fast shared components for better performance
import { FastDataViewComponent } from '../../shared/views/fast-data-view/fast-data-view.component';
import { FastPlotViewComponent } from '../../shared/views/fast-plot-view/fast-plot-view.component';
import { LinkStabilityComponent } from '../../shared/views/link-stability/link-stability.component';

const routes: Routes = [
  {
    path: '',
    component: BangaloreComponent,
    children: [
      { path: '', redirectTo: 'plot-view', pathMatch: 'full' },
      // Use the fast FastDataViewComponent for Bangalore's data view
      {
        path: 'data-view',
        component: FastDataViewComponent,
        data: { dataIdentifier: 'bangalore' }, // Pass 'bangalore' as identifier
      },
      // Use the fast FastPlotViewComponent for Bangalore's plot view
      {
        path: 'plot-view',
        component: FastPlotViewComponent,
        data: { dataIdentifier: 'bangalore' }, // Pass 'bangalore' as identifier
      },
      // Use the LinkStabilityComponent for Bangalore's link stability analysis
      {
        path: 'link-stability',
        component: LinkStabilityComponent,
        data: { dataIdentifier: 'bangalore' }, // Pass 'bangalore' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BangaloreRoutingModule {}

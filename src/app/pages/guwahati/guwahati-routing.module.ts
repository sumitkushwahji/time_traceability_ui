import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuwahatiComponent } from './guwahati.component';
// Import the fast shared components for better performance
import { FastDataViewComponent } from '../../shared/views/fast-data-view/fast-data-view.component';
import { FastPlotViewComponent } from '../../shared/views/fast-plot-view/fast-plot-view.component';
import { LinkStabilityComponent } from '../../shared/views/link-stability/link-stability.component';

const routes: Routes = [
  {
    path: '',
    component: GuwahatiComponent,
    children: [
      { path: '', redirectTo: 'plot-view', pathMatch: 'full' },
      // Use the fast FastDataViewComponent for Guwahati's data view
      {
        path: 'data-view',
        component: FastDataViewComponent,
        data: { dataIdentifier: 'guwahati' }, // Pass 'guwahati' as identifier
      },
      // Use the fast FastPlotViewComponent for Guwahati's plot view
      {
        path: 'plot-view',
        component: FastPlotViewComponent,
        data: { dataIdentifier: 'guwahati' }, // Pass 'guwahati' as identifier
      },
      // Use the LinkStabilityComponent for Guwahati's link stability analysis
      {
        path: 'link-stability',
        component: LinkStabilityComponent,
        data: { dataIdentifier: 'guwahati' }, // Pass 'guwahati' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuwahatiRoutingModule {}

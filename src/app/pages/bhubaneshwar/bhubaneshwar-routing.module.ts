import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BhubaneshwarComponent } from './bhubaneshwar.component';
// Import the fast shared components for better performance
import { FastDataViewComponent } from '../../shared/views/fast-data-view/fast-data-view.component';
import { FastPlotViewComponent } from '../../shared/views/fast-plot-view/fast-plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: BhubaneshwarComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the fast FastDataViewComponent for Bhubaneshwar's data view
      {
        path: 'data-view',
        component: FastDataViewComponent,
        data: { dataIdentifier: 'bhubaneshwar' }, // Pass 'bhubaneshwar' as identifier
      },
      // Use the fast FastPlotViewComponent for Bhubaneshwar's plot view
      {
        path: 'plot-view',
        component: FastPlotViewComponent,
        data: { dataIdentifier: 'bhubaneshwar' }, // Pass 'bhubaneshwar' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BhubaneshwarRoutingModule {}

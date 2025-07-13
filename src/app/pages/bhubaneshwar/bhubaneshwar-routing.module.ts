import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BhubaneshwarComponent } from './bhubaneshwar.component';
// Import the shared components
import { PaginatedDataViewComponent } from '../../shared/views/paginated-data-view/paginated-data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: BhubaneshwarComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the shared PaginatedDataViewComponent for Bhubaneshwar's data view
      {
        path: 'data-view',
        component: PaginatedDataViewComponent,
        data: { dataIdentifier: 'bhubaneshwar' }, // Pass 'bhubaneshwar' as identifier
      },
      // Use the shared PlotViewComponent for Bhubaneshwar's plot view
      {
        path: 'plot-view',
        component: PlotViewComponent,
        data: { dataType: 'specific', dataIdentifier: 'bhubaneshwar' }, // Pass 'bhubaneshwar' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BhubaneshwarRoutingModule {}

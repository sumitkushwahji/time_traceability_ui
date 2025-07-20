import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BangaloreComponent } from './bangalore.component';
// Import the shared components
import { PaginatedDataViewComponent } from '../../shared/views/paginated-data-view/paginated-data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';
import { PaginatedPlotViewComponent } from '../../shared/views/paginated-plot-view/paginated-plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: BangaloreComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the shared PaginatedDataViewComponent for Bangalore's data view
      {
        path: 'data-view',
        component: PaginatedDataViewComponent,
        data: { dataIdentifier: 'bangalore' }, // Pass 'bangalore' as identifier
      },
      // Use the shared PlotViewComponent for Bangalore's plot view
      {
        path: 'plot-view',
        component: PaginatedPlotViewComponent,
        data: { dataType: 'specific', dataIdentifier: 'bangalore' }, // Pass 'bangalore' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BangaloreRoutingModule {}

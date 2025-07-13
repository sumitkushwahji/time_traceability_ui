import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaridabadComponent } from './faridabad.component';
// Import the shared components
import { PaginatedDataViewComponent } from '../../shared/views/paginated-data-view/paginated-data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: FaridabadComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the shared PaginatedDataViewComponent for Faridabad's data view
      {
        path: 'data-view',
        component: PaginatedDataViewComponent,
        data: { dataIdentifier: 'faridabad' }, // Pass 'faridabad' as identifier
      },
      // Use the shared PlotViewComponent for Faridabad's plot view
      {
        path: 'plot-view',
        component: PlotViewComponent,
        data: { dataType: 'specific', dataIdentifier: 'faridabad' }, // Pass 'faridabad' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaridabadRoutingModule {}

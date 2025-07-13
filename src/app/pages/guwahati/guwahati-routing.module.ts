import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuwahatiComponent } from './guwahati.component';
// Import the shared components
import { PaginatedDataViewComponent } from '../../shared/views/paginated-data-view/paginated-data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: GuwahatiComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the shared PaginatedDataViewComponent for Guwahati's data view
      {
        path: 'data-view',
        component: PaginatedDataViewComponent,
        data: { dataIdentifier: 'guwahati' }, // Pass 'guwahati' as identifier
      },
      // Use the shared PlotViewComponent for Guwahati's plot view
      {
        path: 'plot-view',
        component: PlotViewComponent,
        data: { dataType: 'specific', dataIdentifier: 'guwahati' }, // Pass 'guwahati' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuwahatiRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrcComponent } from './drc.component';
// Import the shared components
import { PaginatedDataViewComponent } from '../../shared/views/paginated-data-view/paginated-data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: DrcComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the shared PaginatedDataViewComponent for DRC's data view
      {
        path: 'data-view',
        component: PaginatedDataViewComponent,
        data: { dataIdentifier: 'drc' }, // Pass 'drc' as identifier
      },
      // Use the shared PlotViewComponent for DRC's plot view
      {
        path: 'plot-view',
        component: PlotViewComponent,
        data: { dataType: 'specific', dataIdentifier: 'drc' }, // Pass 'drc' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrcRoutingModule {}

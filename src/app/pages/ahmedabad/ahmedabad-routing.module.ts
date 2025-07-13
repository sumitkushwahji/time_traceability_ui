import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AhmedabadComponent } from './ahmedabad.component';
// Import the shared components
import { PaginatedDataViewComponent } from '../../shared/views/paginated-data-view/paginated-data-view.component';
import { PlotViewComponent } from '../../shared/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: AhmedabadComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      // Use the shared PaginatedDataViewComponent for Ahmedabad's data view
      {
        path: 'data-view',
        component: PaginatedDataViewComponent,
        data: { dataIdentifier: 'ahmedabad' }, // Pass 'ahmedabad' as identifier
      },
      // Use the shared PlotViewComponent for Ahmedabad's plot view
      {
        path: 'plot-view',
        component: PlotViewComponent,
        data: { dataType: 'specific', dataIdentifier: 'ahmedabad' }, // Pass 'ahmedabad' as identifier
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AhmedabadRoutingModule {}

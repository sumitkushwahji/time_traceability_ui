import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BhubaneshwarComponent } from './bhubaneshwar.component';
import { DataViewComponent } from '../bhubaneshwar/views/data-view/data-view.component';
import { PlotViewComponent } from '../bhubaneshwar/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: BhubaneshwarComponent,
    children: [
      { path: '', redirectTo: 'data-view', pathMatch: 'full' },
      { path: 'data-view', component: DataViewComponent },
      { path: 'plot-view', component: PlotViewComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BhubaneshwarRoutingModule {}

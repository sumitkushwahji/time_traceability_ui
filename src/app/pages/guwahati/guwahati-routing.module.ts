import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuwahatiComponent } from './guwahati.component';
import { DataViewComponent } from '../guwahati/views/data-view/data-view.component';
import { PlotViewComponent } from '../guwahati/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: GuwahatiComponent,
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
export class GuwahatiRoutingModule {}

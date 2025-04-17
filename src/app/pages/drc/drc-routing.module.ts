import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrcComponent } from './drc.component';
import { DataViewComponent } from '../drc/views/data-view/data-view.component';
import { PlotViewComponent } from '../drc/views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: DrcComponent,
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
export class DrcRoutingModule {}

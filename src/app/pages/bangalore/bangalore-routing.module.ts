import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BangaloreComponent } from './bangalore.component';
import { DataViewComponent } from './views/data-view/data-view.component';
import { PlotViewComponent } from './views/plot-view/plot-view.component';

const routes: Routes = [
  {
    path: '',
    component: BangaloreComponent,
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
export class BangaloreRoutingModule {}

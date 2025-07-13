import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewComponent } from './data-view/data-view.component'; // This is now the pivoted view
import { PlotViewComponent } from './plot-view/plot-view.component';
import { PaginatedDataViewComponent } from './paginated-data-view/paginated-data-view.component'; // Import the new paginated component

@NgModule({
  declarations: [], // Standalone components are imported, not declared
  imports: [
    CommonModule,
    DataViewComponent, // Import the pivoted DataViewComponent
    PlotViewComponent,  // Import the PlotViewComponent
    PaginatedDataViewComponent // Import the new PaginatedDataViewComponent
  ],
  exports: [
    DataViewComponent, // Export the pivoted DataViewComponent
    PlotViewComponent,  // Export the PlotViewComponent
    PaginatedDataViewComponent // Export the PaginatedDataViewComponent
  ]
})
export class SharedViewsModule { }

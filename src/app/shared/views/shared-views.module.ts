import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewComponent } from './data-view/data-view.component'; // This is now the pivoted view
import { PlotViewComponent } from './plot-view/plot-view.component';
import { PaginatedDataViewComponent } from './paginated-data-view/paginated-data-view.component'; // Import the paginated component
import { PaginatedPlotViewComponent } from './paginated-plot-view/paginated-plot-view.component'; // Import the paginated plot component
import { FastDataViewComponent } from './fast-data-view/fast-data-view.component'; // Import the new fast data view
import { FastPlotViewComponent } from './fast-plot-view/fast-plot-view.component'; // Import the new fast plot view
import { LinkStabilityComponent } from './link-stability/link-stability.component'; // Import the link stability component

@NgModule({
  declarations: [], // Standalone components are imported, not declared
  imports: [
    CommonModule,
    DataViewComponent, // Import the pivoted DataViewComponent
    PlotViewComponent,  // Import the PlotViewComponent
    PaginatedDataViewComponent, // Import the PaginatedDataViewComponent
    PaginatedPlotViewComponent, // Import the PaginatedPlotViewComponent
    FastDataViewComponent, // Import the new FastDataViewComponent
    FastPlotViewComponent,  // Import the new FastPlotViewComponent
    LinkStabilityComponent // Import the LinkStabilityComponent
  ],
  exports: [
    DataViewComponent, // Export the pivoted DataViewComponent
    PlotViewComponent,  // Export the PlotViewComponent
    PaginatedDataViewComponent, // Export the PaginatedDataViewComponent
    PaginatedPlotViewComponent, // Export the PaginatedPlotViewComponent
    FastDataViewComponent, // Export the new FastDataViewComponent
    FastPlotViewComponent,  // Export the new FastPlotViewComponent
    LinkStabilityComponent // Export the LinkStabilityComponent
  ]
})
export class SharedViewsModule { }

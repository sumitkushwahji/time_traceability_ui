import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewComponent } from './data-view/data-view.component';
import { PlotViewComponent } from './plot-view/plot-view.component'; // Import the moved PlotViewComponent

@NgModule({
  // Standalone components are NOT declared in modules.
  // They are imported into the `imports` array of other modules/standalone components.
  declarations: [
    // DataViewComponent and PlotViewComponent are standalone, so they are imported, not declared here.
  ],
  imports: [
    CommonModule,
    DataViewComponent, // Import DataViewComponent directly here as it's standalone
    PlotViewComponent  // Import PlotViewComponent directly here as it's standalone
  ],
  exports: [
    DataViewComponent, // Export DataViewComponent to make it available to other modules
    PlotViewComponent  // Export PlotViewComponent to make it available to other modules
  ]
})
export class SharedViewsModule { }

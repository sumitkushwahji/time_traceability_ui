import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationComponent } from './documentation.component';
import { DocumentationRoutingModule } from './documentation-routing.module';


@NgModule({
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    DocumentationComponent
  ]
})
export class DocumentationModule { }

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploadDashboardComponent } from './shared/file-upload-dashboard/file-upload-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FileUploadDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'time_traceability_ui';
}

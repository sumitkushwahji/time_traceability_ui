import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DocumentationComponent implements OnInit {
  pdfSrc: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // Create a safe URL for the PDF
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl('/assets/docs/readme.pdf');
  }

  ngOnInit(): void {}
}

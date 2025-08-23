import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedViewsModule } from '../../shared/views/shared-views.module';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedViewsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  activeView: string = 'overview';
  
  constructor() { }

  ngOnInit(): void {
  }

  setActiveView(view: string): void {
    this.activeView = view;
  }
}

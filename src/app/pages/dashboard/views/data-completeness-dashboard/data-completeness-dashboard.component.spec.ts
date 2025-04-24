import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCompletenessDashboardComponent } from './data-completeness-dashboard.component';

describe('DataCompletenessDashboardComponent', () => {
  let component: DataCompletenessDashboardComponent;
  let fixture: ComponentFixture<DataCompletenessDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCompletenessDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataCompletenessDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

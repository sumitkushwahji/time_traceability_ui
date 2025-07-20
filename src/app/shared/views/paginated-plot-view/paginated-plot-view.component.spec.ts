import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedPlotViewComponent } from './paginated-plot-view.component';

describe('PaginatedPlotViewComponent', () => {
  let component: PaginatedPlotViewComponent;
  let fixture: ComponentFixture<PaginatedPlotViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedPlotViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatedPlotViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

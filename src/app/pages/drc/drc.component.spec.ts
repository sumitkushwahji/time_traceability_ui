import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrcComponent } from './drc.component';

describe('DrcComponent', () => {
  let component: DrcComponent;
  let fixture: ComponentFixture<DrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

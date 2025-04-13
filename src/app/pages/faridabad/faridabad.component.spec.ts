import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaridabadComponent } from './faridabad.component';

describe('FaridabadComponent', () => {
  let component: FaridabadComponent;
  let fixture: ComponentFixture<FaridabadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaridabadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaridabadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BhubaneshwarComponent } from './bhubaneshwar.component';

describe('BhubaneshwarComponent', () => {
  let component: BhubaneshwarComponent;
  let fixture: ComponentFixture<BhubaneshwarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BhubaneshwarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BhubaneshwarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BangaloreComponent } from './bangalore.component';

describe('BangaloreComponent', () => {
  let component: BangaloreComponent;
  let fixture: ComponentFixture<BangaloreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BangaloreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BangaloreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

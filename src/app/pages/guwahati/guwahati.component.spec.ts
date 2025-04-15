import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuwahatiComponent } from './guwahati.component';

describe('GuwahatiComponent', () => {
  let component: GuwahatiComponent;
  let fixture: ComponentFixture<GuwahatiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuwahatiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuwahatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

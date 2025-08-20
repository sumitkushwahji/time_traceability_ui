import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkStabilityComponent } from './link-stability.component';

describe('LinkStabilityComponent', () => {
  let component: LinkStabilityComponent;
  let fixture: ComponentFixture<LinkStabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkStabilityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkStabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

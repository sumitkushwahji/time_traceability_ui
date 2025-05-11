import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileAvailabilityComponent } from './file-availability.component';

describe('FileAvailabilityComponent', () => {
  let component: FileAvailabilityComponent;
  let fixture: ComponentFixture<FileAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

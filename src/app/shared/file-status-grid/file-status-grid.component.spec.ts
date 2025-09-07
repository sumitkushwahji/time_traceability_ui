import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileStatusGridComponent } from './file-status-grid.component';

describe('FileStatusGridComponent', () => {
  let component: FileStatusGridComponent;
  let fixture: ComponentFixture<FileStatusGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileStatusGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileStatusGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

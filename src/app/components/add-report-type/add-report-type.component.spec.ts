import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReportTypeComponent } from './add-report-type.component';

describe('AddReportTypeComponent', () => {
  let component: AddReportTypeComponent;
  let fixture: ComponentFixture<AddReportTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddReportTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReportTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

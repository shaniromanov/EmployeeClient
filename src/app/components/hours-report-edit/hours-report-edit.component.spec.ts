import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursReportEditComponent } from './hours-report-edit.component';

describe('HoursReportEditComponent', () => {
  let component: HoursReportEditComponent;
  let fixture: ComponentFixture<HoursReportEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoursReportEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursReportEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

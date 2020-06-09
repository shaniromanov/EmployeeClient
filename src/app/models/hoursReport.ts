import { Time } from '@angular/common';

export class HoursReport {
  public Id: number;
  public date: Date;
  public timeStart: Time;
  public timeEnd: Time;
  public dayReportType: number;
  public comment: string;
  public employeeNumber: number;
}

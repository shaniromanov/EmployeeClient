import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HoursReport } from '../models/hoursReport';

@Injectable({
  providedIn: 'root',
})
export class HoursReportService {
  constructor(private http: HttpClient) {}

  addHR(hR: HoursReport) {
    return this.http.post('https://localhost:44319/api/AddHR', hR);
  }

  addHrsTypes(newReportTypeList: any[]) {
    return this.http.post(
      'https://localhost:44319/api/AddHRsTypes',
      newReportTypeList
    );
  }

  getHrsTypes() {
    return this.http.get('https://localhost:44319/api/GetHRsTypes');
  }

  updateHRsForEmployee(empNumber, hRs: HoursReport[]) {
    return this.http.post(
      `https://localhost:44319/api/UpdateHRsForEmployee/${empNumber}`,
      hRs
    );
  }

  getHRsForEmployee(empNumber: string) {
    return this.http.get(
      `https://localhost:44319/api/GetHRsForEmployee/${empNumber}`
    );
  }
}

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

  addHrsTypes(newReportTypeList: string[]) {
    return this.http.post(
      'https://localhost:44319/api/AddHRsTypes',
      newReportTypeList
    );
  }

  updateHRsForEmployee(hRs: HoursReport[]) {
    return this.http.post(
      `https://localhost:44319/api/UpdateHRsForEmployee/${'6'}`,
      hRs
    );
  }

  getHRs() {
    return this.http.get(
      `https://localhost:44319/api/GetHRsForEmployee/${'6'}`
    );
  }
}

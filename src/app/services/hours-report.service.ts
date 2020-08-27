import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HoursReport } from '../models/hoursReport';

@Injectable({
  providedIn: 'root',
})
export class HoursReportService {
  constructor(private http: HttpClient) {}

  addHR(hR: HoursReport) {
    return this.http.post('https://localhost:44370/api/AddHR', hR);
  }

  addHrsTypes(newReportTypeList: any[]) {
    return this.http.post(
      'https://localhost:44370/api/AddHRsTypes',
      newReportTypeList
    );
  }

  getHrsTypes() {
    return this.http.get('https://localhost:44370/api/GetHRsTypes');
  }

  updateHRsForEmployee(empNumber, hRs: HoursReport[]) {
    return this.http.post(
      `https://localhost:44370/api/UpdateHRsForEmployee/${empNumber}`,
      hRs
    );
  }

  getHRsForEmployee(empNumber: string) {
    return this.http.get(
      `https://localhost:44370/api/GetHRsForEmployee/${empNumber}`
    );
  }

  getMonthlyHrsForEmployee(search: {
    employeeNumber: number;
    year: string;
    month: string;
  }) {
    return this.http.get(
      `https://localhost:44370/api/GetMonthlyHrsForEmployee/${search.employeeNumber}/year/${search.year}/month/${search.month}`
    );
  }
}

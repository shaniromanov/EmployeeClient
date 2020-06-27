import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../models/employee';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  currentEmployeeHRs = new BehaviorSubject(null);

  constructor(private http: HttpClient) {}

  uploadImage(formData: FormData) {
    return this.http.post('https://localhost:44319/api/UploadImage', formData);
  }

  addEmployee(employee: Employee) {
    return this.http.post('https://localhost:44319/api/AddEmployee', employee);
  }

  updateEmployee(empNumber: string, value: any) {
    return this.http.post(
      `https://localhost:44319/api/UpdateEmployee/${empNumber}`,
      value
    );
  }

  getEmployeeById(empNumber: string) {
    return this.http.get(
      `https://localhost:44319/api/GetEmployeeById/${empNumber}`
    );
  }

  getEmployees() {
    return this.http.get('https://localhost:44319/api/GetEmployees');
  }
}

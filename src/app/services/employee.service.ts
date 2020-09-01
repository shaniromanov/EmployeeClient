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
    return this.http.post('https://localhost:44370/api/UploadImage', formData,{ responseType: 'text' });
  }

  addEmployee(employee: Employee) {
    console.log(employee)
    return this.http.post('https://localhost:44370/api/AddEmployee', employee);
  }

  updateEmployee(empNumber: string, value: any) {
    return this.http.post(
      `https://localhost:44370/api/UpdateEmployee/${empNumber}`,
      value
    );
  }
  removeEmployee(empNumber: string, value: any) {
    return this.http.post(
      `https://localhost:44370/api/RemoveEmployee/${empNumber}`,
      value
    );
  }

  getEmployeeById(empNumber: string) {
    return this.http.get(
      `https://localhost:44370/api/GetEmployeeById/${empNumber}`
    );
  }

  getEmployees() {
    return this.http.get('https://localhost:44370/api/GetEmployees');
  }
}

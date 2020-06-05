import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  uploadImage(formData: FormData) {
    return this.http.post('https://localhost:44319/api/UploadImage', formData);
  }

  addEmployee(employee: Employee) {
    return this.http.post('https://localhost:44319/api/AddEmployee', employee);
  }

  getEmployees() {
    return this.http.get('https://localhost:44319/api/GetEmployees');
  }
}

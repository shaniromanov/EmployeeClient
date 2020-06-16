import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class SignInUpService {
  managerLogin: Subject<{ isLogin: boolean }> = new Subject();
  empLogin: Subject<{ isLogin: boolean; employee: Employee }> = new Subject();
  isManagerLogin: boolean;
  isEmpLogin: boolean;
  currentEmployee;

  constructor(private http: HttpClient) {
    this.managerLogin.subscribe((obj) => (this.isManagerLogin = obj.isLogin));
    this.empLogin.subscribe((obj) => {
      this.isEmpLogin = obj.isLogin;
      this.currentEmployee = obj.employee;
    });
  }

  getIsManagerLogin() {
    return this.isManagerLogin;
  }

  getIsEmployeeLogin() {
    return this.isEmpLogin;
  }

  getCurrentEmployee() {
    return this.currentEmployee;
  }

  loginEmployee(employeeCardentials: { email: string; employeeId: string }) {
    return this.http.post(
      'https://localhost:44319/api/LoginEmployee',
      employeeCardentials
    );
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class SignInUpService {
  managerLogin: Subject<{ isLoggedIn: boolean }> = new Subject();
  employeeLogin: Subject<{
    isLoggedIn: boolean;
    employee: Employee;
  }> = new Subject();
  managerLoggedIn: boolean;
  employeeLoggedIn: boolean;
  currentEmployee;

  constructor(private http: HttpClient) {}

  setEmployeeLogin(isLoggedIn: boolean, employee: Employee) {
    this.employeeLoggedIn = isLoggedIn;
    this.currentEmployee = employee;
    this.employeeLogin.next({ isLoggedIn, employee });
  }

  setManagerLogin(isLoggedIn: boolean) {
    this.managerLoggedIn = isLoggedIn;
    this.managerLogin.next({ isLoggedIn });
  }

  isManagerLoggedIn() {
    return this.managerLoggedIn;
  }

  isEmployeeLoggedIn() {
    return this.employeeLoggedIn;
  }

  getCurrentEmployee() {
    return this.currentEmployee;
  }

  loginEmployee(employeeCardentials: { email: string; employeeId: string }) {
    return this.http.post(
      'https://localhost:44370/api/LoginEmployee',
      employeeCardentials
    );
  }

  loginManager( userName: string, password: string ) {
   if(userName == "admin" && password == "1234")
     return true;
   else return false;
  }
}

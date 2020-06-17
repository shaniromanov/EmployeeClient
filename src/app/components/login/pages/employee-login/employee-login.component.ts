import { Component, OnInit } from '@angular/core';
import { SignInUpService } from 'src/app/services/sign-in-up.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-employee-login',
  templateUrl: './employee-login.component.html',
  styleUrls: ['./employee-login.component.scss'],
})
export class EmployeeLoginComponent implements OnInit {
  username: string;
  employeeId: string;

  constructor(
    private signInUpService: SignInUpService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  login(form: NgForm) {
    if (!form.valid) return;
    this.signInUpService
      .loginEmployee({
        email: this.username,
        employeeId: this.employeeId,
      })
      .subscribe(
        (emp: Employee) => {
          this.signInUpService.setEmployeeLogin(true, emp);
          this.router.navigateByUrl(`report-edit/${emp.employeeNumber}`);
        },
        (err) => {
          alert('הכניסה נכשלה - נא לוודא נתוני כניסה');
        }
      );
  }
}

import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SignInUpService } from 'src/app/services/sign-in-up.service';
import { Employee } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  currentPage: any;
  pages = [
    {
      route: '/login-main',
      title: 'כניסה למערכת',
      icon: 'login',
      isLogin: true,
      unlimitedAccess: true,
    },
    {
      route: '/manager-login',
      title: 'כניסת מנהל',
      unlimitedAccess: true,
    },
    {
      route: '/emp-login',
      title: 'כניסת עובד',
      unlimitedAccess: true,
    },
    {
      route: '/create-emp',
      title: 'הוספת עובד/ת',
      icon: 'person_add',
      mangerSettings: { access: true, viewMenuTab: true },
    },
    {
      route: '/edit-emp',
      title: 'עריכת עובד/ת',
      icon: 'person_edit',
      mangerSettings: { access: true, viewMenuTab: false },
    },
    {
      route: '/emp-list',
      title: 'רשימת עובדים',
      icon: 'people',
      mangerSettings: { access: true, viewMenuTab: true },
    },
    {
      route: '/search',
      title: 'חיפוש',
      icon: 'search',
      mangerSettings: { access: true, viewMenuTab: true },
    },
    {
      route: '/report-edit',
      title: 'דיווח נוכחות',
      icon: 'calendar_today',
      employeeSettings: { access: true, viewMenuTab: true },
      mangerSettings: { access: true, viewMenuTab: false },
    },
    {
      route: '/login-main',
      title: 'יציאה מהמערכת',
      icon: 'logout',
      isLogout: true,
      unlimitedAccess: true,
    },
  ];
  currentEmployee: Employee;
  managerLoggedIn: boolean;
  employeeLoggedIn: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  currntEmpHRs: Employee;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private signInUpService: SignInUpService,
    private empService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.managerLoggedIn = this.signInUpService.isManagerLoggedIn();
    this.employeeLoggedIn = this.signInUpService.isEmployeeLoggedIn();
    this.currentEmployee = this.signInUpService.getCurrentEmployee();

    this.subsribeToUrlNavigation();
    this.subscribeToManagerLogIn();
    this.subscribeToEmployeeLogIn();
    this.empService.currentEmployeeHRs.subscribe(
      (emp) => (this.currntEmpHRs = emp)
    );
  }

  subsribeToUrlNavigation() {
    this.router.events.subscribe((data: any) => {
      if (!data.url || data.url === '' || data.url === '/') return;

      const currentPage = this.pages.find((page) =>
        data.url.includes(page.route)
      );

      let isAccessableUrl = false;

      if (currentPage.unlimitedAccess) {
        isAccessableUrl = true;
      } else if (this.managerLoggedIn) {
        isAccessableUrl = currentPage.mangerSettings.access;
      } else if (this.employeeLoggedIn) {
        isAccessableUrl = currentPage.employeeSettings.access;
      }

      if (isAccessableUrl) {
        this.currentPage = currentPage;
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }

  subscribeToManagerLogIn() {
    this.signInUpService.managerLogin.subscribe((obj) => {
      this.managerLoggedIn = obj.isLoggedIn;
    });
  }

  subscribeToEmployeeLogIn() {
    this.signInUpService.employeeLogin.subscribe((obj) => {
      this.employeeLoggedIn = obj.isLoggedIn;
      this.currentEmployee = obj.employee;
    });
  }

  logout() {
    if (this.managerLoggedIn) {
      this.signInUpService.setManagerLogin(false);
    } else {
      this.signInUpService.setEmployeeLogin(false, null);
    }
  }

  fullName(emp: Employee) {
    if (!emp) return;
    return emp.firstName + ' ' + emp.lastName;
  }
}

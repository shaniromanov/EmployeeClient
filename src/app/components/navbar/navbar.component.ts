import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SignInUpService } from 'src/app/services/sign-in-up.service';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  selectedPageTitle: string;
  pages = [
    { route: '/login-main', title: 'כניסה למערכת', icon: 'login' },
    { route: '/manager-login', title: 'כניסת מנהל', hidden: true },
    { route: '/emp-login', title: 'כניסת עובד', hidden: true },
    {
      route: '/create-emp',
      title: 'הוספת עובד/ת',
      icon: 'person_add',
      isManager: true,
      hidden: true,
    },
    {
      route: '/edit-emp',
      title: 'עריכת עובד/ת',
      icon: 'person_edit',
      isManager: true,
      hidden: true,
    },
    {
      route: '/emp-list',
      title: 'רשימת עובדים',
      icon: 'people',
      isManager: true,
      hidden: true,
    },
    { route: '/search', title: 'חיפוש', icon: 'search', isManager: true },
    {
      route: '/report-edit',
      title: 'דיווח נוכחות',
      icon: 'calendar_today',
      isEmp: true,
      hidden: true,
    },
    {
      route: '/login-main',
      title: 'יציאה מהמערכת',
      icon: 'logout',
      isLogout: true,
      hidden: true,
    },
  ];
  currentEmployee: Employee;
  isManager: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private signInUpService: SignInUpService
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((data: any) => {
      if (!data.url || data.url === '' || data.url === '/') return;
      this.selectedPageTitle = this.pages.find((page) =>
        data.url.includes(page.route)
      ).title;
    });

    this.subscribeToManagerLogInOut();
    this.subscribeToEmployeeLogInOut();
  }

  subscribeToManagerLogInOut() {
    this.signInUpService.managerLogin.subscribe((obj: any) => {
      if (obj.isLogin) {
        this.isManager = true;
        this.pages.find((page) => page.route === '/login-main').hidden = true;
        this.pages.find((page) => page.icon === 'logout').hidden = false;
        this.pages.forEach((page) => {
          if (page.isManager) {
            page.hidden = false;
          } else if (page.isEmp) {
            page.hidden = true;
          }
        });
      } else {
        this.isManager = false;
        this.pages.forEach((page) => (page.hidden = true));
        this.pages.find((page) => page.route === '/login-main').hidden = false;
      }
    });
  }

  subscribeToEmployeeLogInOut() {
    this.signInUpService.empLogin.subscribe((obj: any) => {
      if (obj.isLogin) {
        this.currentEmployee = obj.employee;
        this.pages.find((page) => page.route === '/login-main').hidden = true;
        this.pages.find((page) => page.icon === 'logout').hidden = false;
        this.pages.forEach((page) => {
          if (page.isEmp) {
            page.hidden = false;
          } else if (page.isManager) {
            page.hidden = true;
          }
        });
      } else {
        this.pages.forEach((page) => (page.hidden = true));
        this.pages.find((page) => page.route === '/login-main').hidden = false;
        this.currentEmployee = null;
      }
    });
  }

  logout() {
    if (this.isManager) {
      this.signInUpService.managerLogin.next({ isLogin: false });
    } else {
      this.signInUpService.empLogin.next({ isLogin: false, employee: null });
    }
  }
}

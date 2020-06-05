import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  selectedPageTitle: string;
  pages = [
    { route: '/create-emp', title: 'הוספת עובד/ת' },
    { route: '/emp-list', title: 'רשימת עובדים' },
    { route: '/emp-search', title: 'חיפוש' },
    { route: '/emp-report', title: 'דיווח נוכחות' },
  ];

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((data: any) => {
      if (!data.url) return;
      this.selectedPageTitle = this.pages.find(
        (page) => page.route === data.url
      ).title;
    });
  }
}

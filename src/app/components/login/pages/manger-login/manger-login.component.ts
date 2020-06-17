import { Component, OnInit } from '@angular/core';
import { SignInUpService } from 'src/app/services/sign-in-up.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manger-login',
  templateUrl: './manger-login.component.html',
  styleUrls: ['./manger-login.component.scss'],
})
export class MangerLoginComponent implements OnInit {
  username: string;
  password: string;
  constructor(
    private signInUpService: SignInUpService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  login(form: NgForm) {
    if (!form.valid) return;
    this.signInUpService.setManagerLogin(true);
    this.router.navigateByUrl('emp-list');
  }
}

import { Component } from '@angular/core';
import { PrintService } from './services/print.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'client';
  constructor(public printService: PrintService) {}
}

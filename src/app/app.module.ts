import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeesTableComponent } from './components/employees-table/employees-table.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MaterialSharedModule } from './shared/material-shared/material-shared.module';
import { CreateEmployeeComponent } from './components/create-employee/create-employee.component';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getHebrewPaginatorIntl } from './shared/hebrew-paginator-intl';
import { MaterialDialogComponent } from './components/material-dialog/material-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    EmployeesTableComponent,
    NavbarComponent,
    CreateEmployeeComponent,
    MaterialDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    ReactiveFormsModule,
    MaterialSharedModule,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    FormsModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getHebrewPaginatorIntl() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

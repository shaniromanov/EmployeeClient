import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEmployeeComponent } from './components/create-employee/create-employee.component';
import { EmployeesTableComponent } from './components/employees-table/employees-table.component';
import { HoursReportEditComponent } from './components/hours-report-edit/hours-report-edit.component';
import { LoginComponent } from './components/login/login.component';
import { MangerLoginComponent } from './components/login/pages/manger-login/manger-login.component';
import { EmployeeLoginComponent } from './components/login/pages/employee-login/employee-login.component';
import { SearchComponent } from './components/search/search.component';

const routes: Routes = [
  { path: '', redirectTo: 'login-main', pathMatch: 'full' },
  { path: 'login-main', component: LoginComponent },
  { path: 'manager-login', component: MangerLoginComponent },
  { path: 'emp-login', component: EmployeeLoginComponent },
  { path: 'create-emp', component: CreateEmployeeComponent },
  { path: 'edit-emp/:empId', component: CreateEmployeeComponent },
  { path: 'emp-list', component: EmployeesTableComponent },
  { path: 'report-edit/:empId', component: HoursReportEditComponent },
  { path: 'search', component: SearchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

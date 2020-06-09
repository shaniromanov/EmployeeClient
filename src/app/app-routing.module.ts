import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEmployeeComponent } from './components/create-employee/create-employee.component';
import { EmployeesTableComponent } from './components/employees-table/employees-table.component';
import { HoursReportEditComponent } from './components/hours-report-edit/hours-report-edit.component';

const routes: Routes = [
  { path: 'create-emp', component: CreateEmployeeComponent },
  { path: 'emp-list', component: EmployeesTableComponent },
  { path: 'report-edit', component: HoursReportEditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

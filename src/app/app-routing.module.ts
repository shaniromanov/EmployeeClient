import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEmployeeComponent } from './components/create-employee/create-employee.component';
import { EmployeesTableComponent } from './components/employees-table/employees-table.component';

const routes: Routes = [
  { path: 'create-emp', component: CreateEmployeeComponent },
  { path: 'emp-list', component: EmployeesTableComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

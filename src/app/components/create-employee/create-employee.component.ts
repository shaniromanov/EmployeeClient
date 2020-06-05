import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss'],
})
export class CreateEmployeeComponent implements OnInit {
  employee = new Employee();

  newEmpForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    employeeId: [null, Validators.required],
    phone: [null, Validators.required],
    email: [null, Validators.required],
    imageUrl: [null, Validators.required],
  });
  constructor(private empService: EmployeeService, private fb: FormBuilder) {}

  ngOnInit(): void {}

  uploadImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
    const formData = new FormData();
    formData.append('userImage', file, file.name);
    this.empService
      .uploadImage(formData)
      .subscribe((url: string[]) =>
        this.newEmpForm.setValue({ ...this.newEmpForm.value, imageUrl: url })
      );
  }

  onSubmit() {
    if (this.newEmpForm.invalid) {
      return;
    }

    for (const field in this.newEmpForm.value) {
      const value = this.newEmpForm.value[field];
      this.employee[field] = value;
    }
    this.empService
      .addEmployee(this.employee)
      .subscribe((emp) => alert('succes creation:)'));
  }
}

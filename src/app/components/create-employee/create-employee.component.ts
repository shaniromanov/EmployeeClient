import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';

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
    employeeId: [null, [Validators.required, Validators.pattern('^[0-9]{9}')]],
    phone: [
      null,
      [
        Validators.required,
        Validators.pattern('[0-9 ]*$'),
        Validators.maxLength(10),
        Validators.minLength(9),
      ],
    ],
    email: [null, [Validators.required, Validators.email]],
    imageUrl: [null, Validators.required],
  });

  fileUploadedName: string;

  constructor(
    private empService: EmployeeService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  uploadImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.fileUploadedName = file.name;
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
    this.empService.addEmployee(this.employee).subscribe(
      (emp) => this.openDialog(true),
      (err) => {
        this.openDialog(false);
      }
    );
  }

  openDialog(isOK): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '350px',
      data: {
        title:
          'הוספת עובד/ת: ' +
          this.employee.firstName +
          ' ' +
          this.employee.lastName,
        content: isOK
          ? 'ההרשמה בוצעה בהצלחה'
          : 'ההרשמה נכשלה - יתכן שעובד בעל מספר זהות זה קיים במערכת',
        okBtn: { value: 'הבנתי' },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  resetForm() {
    this.fileUploadedName = null;
    this.newEmpForm.reset();
  }
}

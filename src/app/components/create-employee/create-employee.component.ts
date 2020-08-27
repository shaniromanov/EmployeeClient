import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

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
    hoursPerDay: ['09:00', Validators.required],
    maximumExtraHours: ['00:00'],
  });

  fileUploadedName: string;

  constructor(
    private empService: EmployeeService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const empNumber = this.route.snapshot.paramMap.get('empId');
    if (empNumber) {
      this.empService.getEmployeeById(empNumber).subscribe((emp) => {
        const empMappedToForm = {};
        for (const key in this.newEmpForm.value) {
          empMappedToForm[key] = emp[key] ? emp[key] : null;
        }
        this.newEmpForm.setValue(empMappedToForm);
      });
    }
  }

  uploadImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.fileUploadedName = file.name;
    const formData = new FormData();
    formData.append('userImage', file, file.name);
    this.empService
      .uploadImage(formData)
      .subscribe((url: string) =>{
        console.log  ("=========",url)
        this.newEmpForm.setValue({ ...this.newEmpForm.value, imageUrl: url })
      }
       
      );
  }

  onSubmit() {
    if (this.newEmpForm.invalid) {
      return;
    }

    const empNumber = this.route.snapshot.paramMap.get('empId');
    if (empNumber) {
      this.empService
        .updateEmployee(empNumber, {
          ...this.newEmpForm.value,
          employeeNumber: +empNumber,
        })
        .subscribe(
          (emp) => this.openDialog(true),
          (err) => {
            this.openDialog(false);
          }
        );
    } else {
      this.empService.addEmployee(this.newEmpForm.value).subscribe(
        (emp) => this.openDialog(true, true),
        (err) => {
          this.openDialog(false, true);
        }
      );
    }
  }

  openDialog(isOK, isNew?): void {
    const fullName =
      this.newEmpForm.value.firstName + ' ' + this.newEmpForm.value.lastName;

    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '350px',
      data: {
        title: isNew
          ? 'הוספת עובד/ת: ' + fullName
          : 'עדכון פרטי עובד/ת: ' + fullName,
        content: isOK ? 'הפעולה בוצעה בהצלחה' : 'הפעולה נכשלה',
        okBtn: { value: 'אישור' },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (isNew) {
        this.router.navigateByUrl('/emp-list');
      }
    });
  }

  resetForm() {
    this.fileUploadedName = null;
    this.newEmpForm.reset();
  }
}

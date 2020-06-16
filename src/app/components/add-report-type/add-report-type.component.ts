import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-add-report-type',
  templateUrl: './add-report-type.component.html',
  styleUrls: ['./add-report-type.component.scss'],
})
export class AddReportTypeComponent implements OnInit {
  myForm: any;

  constructor(
    public dialogRef: MatDialogRef<AddReportTypeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private fb: FormBuilder
  ) {}

  get typesList(): FormArray {
    return <FormArray>this.myForm.controls.typesList;
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      typesList: this.fb.array([]),
    });
    this.addNewType();
  }

  addNewType() {
    this.typesList.push(this.getDefaultItem());
  }

  getDefaultItem(): FormGroup {
    return this.fb.group({
      value: [null, Validators.required],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

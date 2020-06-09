import { Component, OnInit } from '@angular/core';
import { HoursReportService } from 'src/app/services/hours-report.service';
import { HoursReport } from 'src/app/models/hoursReport';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';
import { AddReportTypeComponent } from '../add-report-type/add-report-type.component';

@Component({
  selector: 'app-hours-report-edit',
  templateUrl: './hours-report-edit.component.html',
  styleUrls: ['./hours-report-edit.component.scss'],
})
export class HoursReportEditComponent implements OnInit {
  hrs: HoursReport[] = [];
  newHr = new HoursReport();
  minDate: Date;
  maxDate: Date;

  newForm: FormGroup;

  get hRsList(): FormArray {
    return <FormArray>this.newForm.controls.hRsList;
  }

  constructor(
    private hRService: HoursReportService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
  }

  ngOnInit(): void {
    this.newForm = this.fb.group({
      hRsList: this.fb.array([]),
    });

    this.hRService.getHRs().subscribe((res: any) => {
      this.hrs = res;
      this.hrs.forEach((hr) => {
        this.addReportItem(hr);
      });
      this.subscribeTimeChanges();
    });
  }

  subscribeTimeChanges() {
    this.hRsList.controls.forEach((ctrl) => {
      ctrl.valueChanges.subscribe((value) => {
        const totalHours = this.getTotalHours(value);
        const index = this.hRsList.controls.indexOf(ctrl);
        let totalHoursCtrl = this.hRsList.controls[index].get('totalHours');
        if (totalHoursCtrl.value !== totalHours) {
          totalHoursCtrl.setValue(totalHours);
        }
      });
    });
  }

  createNewReportItem() {
    this.hRsList.push(this.getDefaultItem());
  }

  getDefaultItem(): FormGroup {
    return this.fb.group({
      date: [null, Validators.required],
      timeStart: [null, [Validators.required]],
      timeEnd: [null, [Validators.required]],
      dayReportType: [null],
      comment: [null],
    });
  }

  createItemFormReport(hr: HoursReport): FormGroup {
    return this.fb.group({
      date: [hr.date, Validators.required],
      timeStart: [hr.timeStart, [Validators.required]],
      timeEnd: [hr.timeEnd, [Validators.required]],
      dayReportType: [hr.dayReportType || null],
      totalHours: [this.getTotalHours(hr)],
      comment: [hr.comment || null],
    });
  }

  addReportItem(hr): void {
    this.hRsList.push(this.createItemFormReport(hr));
  }

  removeReportItem(index): void {
    this.hRsList.removeAt(index);
  }

  exportToExcel(): void {
    /*name of the excel-file which will be downloaded. */

    const fileName = 'ExcelSheet.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.getHrsArray());
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, fileName);
  }

  getTotalHours(item) {
    if (!item) return;
    let end = item.timeEnd;
    let start = item.timeStart;
    if (!end || !start) return '00:00';
    let diff = moment
      .utc(moment(end, 'HH:mm').diff(moment(start, 'HH:mm')))
      .format('HH:mm');
    return diff;
  }

  addHr() {
    this.hRService.addHR(this.newHr).subscribe((res) => {
      alert('added');
    });
  }

  submitForm() {
    if (!this.newForm.valid) return;
    console.log(this.newForm);
    this.hRService
      .updateHRsForEmployee(this.getHrsArray())
      .subscribe(() => alert('success'));
  }

  getHrsArray(): HoursReport[] {
    let hRsArray = [];
    this.hRsList.controls.forEach((ctrl) => {
      const itemForExcel = hRsArray.push(ctrl.value);
    });
    return hRsArray;
  }

  addSelction() {
    this.openDialog(true);
  }

  openDialog(isOK): void {
    const dialogRef = this.dialog.open(AddReportTypeComponent, {
      width: '350px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}

import { Component, OnInit } from '@angular/core';
import { HoursReportService } from 'src/app/services/hours-report.service';
import { HoursReport } from 'src/app/models/hoursReport';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';
import { AddReportTypeComponent } from '../add-report-type/add-report-type.component';
import { ActivatedRoute } from '@angular/router';
import { isString } from 'util';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { SignInUpService } from 'src/app/services/sign-in-up.service';

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
  hRsTypes: { Id: number; value: string }[];
  currentEmployee: Employee = new Employee();
  isManager: boolean;

  get hRsList(): FormArray {
    return <FormArray>this.newForm.controls.hRsList;
  }

  constructor(
    private hRService: HoursReportService,
    private empService: EmployeeService,
    private signInUpService: SignInUpService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
  }

  ngOnInit(): void {
    this.newForm = this.fb.group({
      hRsList: this.fb.array([]),
    });

    const empNumber = this.route.snapshot.paramMap.get('empId');

    this.hRService.getHRsForEmployee(empNumber).subscribe((res: any) => {
      this.hrs = res;
      this.hrs.forEach((hr) => {
        this.addReportItem(hr);
      });
      this.subscribeTimeChanges();
    });

    this.hRService
      .getHrsTypes()
      .subscribe(
        (hRsTypes: { Id: number; value: string }[]) =>
          (this.hRsTypes = hRsTypes)
      );

    this.empService.getEmployeeById(empNumber).subscribe((emp: Employee) => {
      this.currentEmployee = emp;
    });

    this.isManager = this.signInUpService.isManagerLoggedIn();

    this.signInUpService.managerLogin.subscribe(
      (obj) => (this.isManager = obj.isLoggedIn)
    );
  }

  subscribeTimeChanges() {
    this.hRsList.controls.forEach((ctrl) => {
      this.onCtrlValueChanges(ctrl);
    });
  }

  onCtrlValueChanges(ctrl) {
    ctrl.valueChanges.subscribe((value) => {
      if (!value.timeStart && !value.timeEnd) return;
      this.updateTotalHours(ctrl, value);
      this.updateUsualHours(ctrl, value);
      this.updateExtraHours(ctrl, value);
    });
  }

  updateTotalHours(ctrl, value) {
    const totalHours = this.getTotalHours(value);
    const index = this.hRsList.controls.indexOf(ctrl);
    let totalHoursCtrl = this.hRsList.controls[index].get('totalHours');
    if (totalHoursCtrl.value !== totalHours) {
      totalHoursCtrl.setValue(totalHours);
    }
  }

  updateUsualHours(ctrl, value) {
    const usualHours = this.getUsualHours(value);
    const index = this.hRsList.controls.indexOf(ctrl);
    let usualHoursCtrl = this.hRsList.controls[index].get('usualHours');
    if (usualHoursCtrl.value !== usualHours) {
      usualHoursCtrl.setValue(usualHours);
    }
  }

  updateExtraHours(ctrl, value) {
    const extraHours = this.getExtraHours(value);
    const index = this.hRsList.controls.indexOf(ctrl);
    let extraHoursCtrl = this.hRsList.controls[index].get('extraHours');
    if (extraHoursCtrl.value !== extraHours) {
      extraHoursCtrl.setValue(extraHours);
    }
  }

  createNewReportItem() {
    const newCtrl = this.getDefaultItem();
    this.onCtrlValueChanges(newCtrl);
    this.hRsList.push(newCtrl);
  }

  getDefaultItem(): FormGroup {
    return this.fb.group({
      date: [null, Validators.required],
      timeStart: [null, [Validators.required]],
      timeEnd: [null, [Validators.required]],
      dayReportType: [null, [Validators.required]],
      totalHours: [null],
      usualHours: [null],
      extraHours: [null],
      comment: [null],
    });
  }

  createItemFormReport(hr: HoursReport): FormGroup {
    const totalHours = this.getTotalHours(hr);

    return this.fb.group({
      date: [hr.date, Validators.required],
      timeStart: [hr.timeStart, [Validators.required]],
      timeEnd: [hr.timeEnd, [Validators.required]],
      dayReportType: [hr.dayReportType || null],
      totalHours: [totalHours],
      usualHours: [this.getUsualHours(hr, totalHours)],
      extraHours: [this.getExtraHours(hr, totalHours)],
      comment: [hr.comment || null],
    });
  }

  addReportItem(hr): void {
    const itemFromReport = this.createItemFormReport(hr);
    this.hRsList.push(itemFromReport);
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
    const end = item.timeEnd;
    const start = item.timeStart;
    if (!end || !start) {
      return '00:00';
    }
    const diff = moment
      .utc(moment(end, 'HH:mm').diff(moment(start, 'HH:mm')))
      .format('HH:mm');
    return diff;
  }

  getUsualHours(item, hrTotalsHours?) {
    if (!item) return;
    const totalHours = item.totalHours || hrTotalsHours;
    const hoursPerDay = this.currentEmployee.hoursPerDay;
    if (!totalHours) {
      return '00:00';
    }
    const diff = moment(totalHours, 'HH:mm').diff(moment(hoursPerDay, 'HH:mm'));
    if (diff > 0) {
      return moment(hoursPerDay, 'HH:mm:ss').format('HH:mm');
    }
    return totalHours;
  }

  getExtraHours(item, hrTotalsHours?) {
    if (!item) return;
    const totalHours = item.totalHours || hrTotalsHours;
    const hoursPerDay = this.currentEmployee.hoursPerDay;
    if (!totalHours) {
      return '00:00';
    }
    const diff = moment(totalHours, 'HH:mm').diff(moment(hoursPerDay, 'HH:mm'));
    if (diff > 0) {
      const formmatedDiff = moment.utc(diff).format('HH:mm');
      const maxExtraHours = this.currentEmployee.maximumExtraHours;
      const formattedMaxExtraHours = moment(maxExtraHours, 'HH:mm:ss').format(
        'HH:mm'
      );
      const maxDiff = moment(formattedMaxExtraHours, 'HH:mm').diff(
        moment(formmatedDiff, 'HH:mm')
      );

      if (maxDiff >= 0) {
        return formmatedDiff;
      }
      return formattedMaxExtraHours;
    }
    return '00:00';
  }

  addHr() {
    this.hRService.addHR(this.newHr).subscribe((res) => {
      alert('added');
    });
  }

  submitForm() {
    if (!this.newForm.valid) return;
    const empNumber = this.route.snapshot.paramMap.get('empId');
    this.hRService
      .updateHRsForEmployee(empNumber, this.getHrsArray())
      .subscribe(() => this.openSavedDialog());
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

    dialogRef.afterClosed().subscribe((newReportTypeList) => {
      if (!newReportTypeList) return;
      newReportTypeList = newReportTypeList.filter(
        (item) => item.value && item.value.length
      );
      if (!newReportTypeList.length) return;
      this.hRService.addHrsTypes(newReportTypeList).subscribe((res: any) => {
        this.hRsTypes = res;
      });
    });
  }

  openSavedDialog(): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '350px',
      data: {
        title: 'דיווח נוכחות עודכן בהצלחה',
        okBtn: { value: 'אישור' },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}

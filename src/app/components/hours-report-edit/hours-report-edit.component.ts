import { Component, OnInit, Input } from '@angular/core';
import { HoursReportService } from 'src/app/services/hours-report.service';
import { HoursReport } from 'src/app/models/hoursReport';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';
import { AddReportTypeComponent } from '../add-report-type/add-report-type.component';
import { ActivatedRoute, Router } from '@angular/router';
import { isString } from 'util';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { SignInUpService } from 'src/app/services/sign-in-up.service';
import * as _ from 'lodash';
import { PrintService } from 'src/app/services/print.service';
import { utils } from 'protractor';

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

  newForm: FormGroup = this.fb.group({
    hRsList: this.fb.array([]),
  });

  hRsTypes: { Id: number; value: string }[];
  currentEmployee: Employee = new Employee();
  isManager: boolean;
  hebrewTitles = {
    date: 'תאריך:',
    timeStart: 'שעת התחלה:',
    timeEnd: 'שעת סיום:',
    dayReportType: 'סוג דיווח:',
    totalHours: 'סך שעות:',
    usualHours: 'שעות רגילות:',
    extraHours: 'שעות נוספות:',
    comment: 'הערה:',
  };

  monthYearSearch: string;
  isReadonly: boolean;

  @Input() set monthlyHRs(value) {
    if (this.hRsList.controls.length > 0) {
      this.hRsList = this.fb.array([]);
    }
    this.hrs = value;
    this.hrs.forEach((hr) => {
      this.addReportItem(hr);
    });
    this.subscribeTimeChanges();
  }

  _currentSearch;
  @Input() set currentSearch(search) {
    this._currentSearch = search;
    this.empService
      .getEmployeeById(search.employeeNumber)
      .subscribe((emp: Employee) => {
        this.currentEmployee = emp;
      });

    this.monthYearSearch = search.month + '/' + search.year;
  }

  private _searchMode: boolean;
  @Input() set searchMode(value) {
    this._searchMode = value;
    this.isReadonly = true;
  }
  get searchMode() {
    return this._searchMode;
  }

  get hRsList(): FormArray {
    return <FormArray>this.newForm.controls.hRsList;
  }
  set hRsList(value) {
    this.newForm.controls.hRsList = value;
  }

  constructor(
    private hRService: HoursReportService,
    private empService: EmployeeService,
    private signInUpService: SignInUpService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private printService: PrintService
  ) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
  }

  ngOnInit() {
    if (!this.searchMode) {
      const empNumber = this.route.snapshot.paramMap.get('empId');

      this.hRService.getHRsForEmployee(empNumber).subscribe((res: any) => {
        this.hrs = res;
        this.hrs.forEach((hr) => {
          this.addReportItem(hr);
        });
        this.subscribeTimeChanges();
      });

      this.empService.getEmployeeById(empNumber).subscribe((emp: Employee) => {
        this.currentEmployee = emp;
        this.empService.currentEmployeeHRs.next(emp);
      });
    }

    this.hRService
      .getHrsTypes()
      .subscribe(
        (hRsTypes: { Id: number; value: string }[]) =>
          (this.hRsTypes = hRsTypes)
      );

    this.isManager = this.signInUpService.isManagerLoggedIn();

    this.signInUpService.managerLogin.subscribe(
      (obj) => (this.isManager = obj.isLoggedIn)
    );

    if (this.route.snapshot.routeConfig.path.includes('print')) {
      this.isReadonly = true;
      let interval = setInterval(() => {
        if (
          this.hRsTypes &&
          this.hRsList?.controls?.length > 0 &&
          this.currentEmployee
        ) {
          clearInterval(interval);
          this.printService.onDataReady();
        }
      });
    }
  }

  subscribeTimeChanges() {
    this.hRsList.controls.forEach((ctrl) => {
      this.onCtrlValueChanges(ctrl);
    });
  }

  onCtrlValueChanges(ctrlChanged) {
    ctrlChanged.valueChanges.subscribe((value) => {
      if (!value.timeStart && !value.timeEnd) return;

      this.updateTotalHours(ctrlChanged, value);
      this.updateSameDatesCtrls(ctrlChanged.value.date);
    });
  }

  updateSameDatesCtrls(date) {
    this.hRsList.controls.forEach((ctrl) => {
      if (this._date(date) !== this._date(ctrl.value.date)) return;
      this.updateUsualHours(ctrl, ctrl.value);
      this.updateExtraHours(ctrl, ctrl.value);
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
      date: [{ value: null, disabled: this.isReadonly }, Validators.required],
      timeStart: [
        { value: null, disabled: this.isReadonly },
        [Validators.required],
      ],
      timeEnd: [
        { value: null, disabled: this.isReadonly },
        [Validators.required],
      ],
      dayReportType: [
        { value: null, disabled: this.isReadonly },
        [Validators.required],
      ],
      totalHours: [{ value: null, disabled: this.isReadonly }],
      usualHours: [{ value: null, disabled: this.isReadonly }],
      extraHours: [{ value: null, disabled: this.isReadonly }],
      comment: [{ value: null, disabled: this.isReadonly }],
    });
  }

  createItemFormReport(hr: HoursReport): FormGroup {
    const totalHours = this.getTotalHours(hr);

    return this.fb.group({
      date: [
        { value: hr.date, disabled: this.isReadonly },
        Validators.required,
      ],
      timeStart: [
        { value: hr.timeStart, disabled: this.isReadonly },
        [Validators.required],
      ],
      timeEnd: [
        { value: hr.timeEnd, disabled: this.isReadonly },
        [Validators.required],
      ],
      dayReportType: [
        { value: hr.dayReportType || null, disabled: this.isReadonly },
      ],
      totalHours: [{ value: totalHours, disabled: this.isReadonly }],
      usualHours: [
        {
          value: this.getUsualHours(hr, totalHours),
          disabled: this.isReadonly,
        },
      ],
      extraHours: [
        {
          value: this.getExtraHours(hr, totalHours),
          disabled: this.isReadonly,
        },
      ],
      comment: [{ value: hr.comment || null, disabled: this.isReadonly }],
    });
  }

  addReportItem(hr): void {
    const itemFromReport = this.createItemFormReport(hr);
    this.hRsList.push(itemFromReport);
  }

  removeReportItem(index, date): void {
    this.hRsList.removeAt(index);
    this.updateSameDatesCtrls(date);
  }

  exportToExcel(): void {
    /*name of the excel-file which will be downloaded. */
    const { firstName, lastName } = this.currentEmployee;
    const fileName = `${firstName} ${lastName} נוכחות.xlsx`;
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.getHrsArray(true),
      { header: Object.values(this.hebrewTitles).reverse() }
    );
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
    let totalHours = item.totalHours || hrTotalsHours;
    let sameDates = this.getSameDates(item.date, hrTotalsHours ? true : false);
    if (sameDates.length > 1) {
      totalHours = moment.duration('00:00');
      sameDates.forEach((item) => {
        totalHours.add(this.getTotalHours(item));
      });
      totalHours = this.getTimeFromDuration(totalHours);
    }
    if (!totalHours) {
      return '00:00';
    }
    const hoursPerDay = this.currentEmployee.hoursPerDay;
    const diff = moment(totalHours, 'HH:mm').diff(moment(hoursPerDay, 'HH:mm'));
    if (diff > 0) {
      return moment(hoursPerDay, 'HH:mm:ss').format('HH:mm');
    }
    return totalHours;
  }

  getSameDates(date, isFromOriginal?) {
    const list = isFromOriginal ? this.hrs : this.hRsList.value;
    return list.filter((item) => this._date(item.date) === this._date(date));
  }

  _date(date) {
    if (moment.isMoment(date)) return date.format('DD/MM/YYYY');
    return moment(date).format('DD/MM/YYYY');
  }

  _time(time) {
    return moment(time).format('HH:mm');
  }

  getExtraHours(item, hrTotalsHours?) {
    if (!item) return;
    let totalHours = item.totalHours || hrTotalsHours;
    let sameDates = this.getSameDates(item.date, hrTotalsHours ? true : false);
    if (sameDates.length > 1) {
      totalHours = moment.duration('00:00');
      sameDates.forEach((item) => {
        totalHours.add(this.getTotalHours(item));
      });
      totalHours = this.getTimeFromDuration(totalHours);
    }
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

  getMonthlyTotalHrs(key: string) {
    let res = moment.duration('00:00');
    this.hRsList.controls.forEach((ctrl) => {
      res = res.add(ctrl.value[key]);
    });
    var hours = Math.floor(res.asHours());
    var mins = Math.floor(res.asMinutes()) - hours * 60;
    return (hours + mins / 60).toFixed(2);
  }

  getMonthlyHrs(key: string) {
    let res = moment.duration('00:00');
    let daysObjHrs = this.getDayesObject();

    Object.keys(daysObjHrs).forEach((day) => {
      res = res.add(daysObjHrs[day][0][key]);
    });
    var hours = Math.floor(res.asHours());
    var mins = Math.floor(res.asMinutes()) - hours * 60;
    return (hours + mins / 60).toFixed(2);
  }

  getTimeFromDuration(duration: moment.Duration) {
    var hours = Math.floor(duration.asHours());
    var mins = Math.floor(duration.asMinutes()) - hours * 60;
    let _hours = hours.toString();
    let _mins = mins.toString();
    _hours = _hours.length < 2 ? 0 + _hours : _hours;
    _mins = _mins.length < 2 ? 0 + _mins : _mins;
    return `${_hours}:${_mins}`;
  }

  getRequiredMonthlyHours() {
    if (!this.currentEmployee?.hoursPerDay) return;
    const endDayOfMonth = +this.getMonthlyWorkDaysOfCurrentSearchMonth();
    const HoursPerDay = +this.currentEmployee.hoursPerDay
      .toString()
      .split(':')[0];
    const minsPerDay = +this.currentEmployee.hoursPerDay
      .toString()
      .split(':')[1];
    const monthlyUsualHours =
      endDayOfMonth * HoursPerDay + endDayOfMonth * (minsPerDay / 60);
    return monthlyUsualHours;
  }

  getMonthlyWorkDaysOfCurrentSearchMonth() {
    const endDateOfMonth = moment(this.monthYearSearch, 'M/YYYY').endOf(
      'month'
    );
    return (
      +endDateOfMonth.format('D') -
      this.getAmountOfWeekDaysInMonth(endDateOfMonth, 6)
    );
  }

  getAmountOfWeekDaysInMonth(date, weekday) {
    date.date(1);
    var dif = ((7 + (weekday - date.weekday())) % 7) + 1;
    console.log(
      'weekday: ' +
        weekday +
        ', FirstOfMonth: ' +
        date.weekday() +
        ', dif: ' +
        dif
    );
    return Math.floor((date.daysInMonth() - dif) / 7) + 1;
  }

  getMonthlyWorkedDays() {
    let daysObj = {};
    this.hRsList.value.forEach((hr) => {
      let _date = this._date(hr.date);
      if (daysObj[_date]) {
      } else {
        daysObj[_date] = true;
      }
    });
    return Object.keys(daysObj).length;
  }

  getDayesObject() {
    let daysObj = {};
    this.hRsList.value.forEach((hr) => {
      let _date = this._date(hr.date);
      if (daysObj[_date]) {
        daysObj[_date].push(hr);
      } else {
        daysObj[_date] = [];
      }
    });
    return daysObj;
  }

  addHr() {
    this.hRService.addHR(this.newHr).subscribe((res) => {
      alert('added');
    });
  }

  submitForm() {
    if (!this.newForm.valid) return;
    this.hRService
      .updateHRsForEmployee(
        this.currentEmployee.employeeNumber,
        this.getHrsArray()
      )
      .subscribe(() => this.openSavedDialog());
  }

  getHrsArray(isForExcel?): HoursReport[] {
    let hRsArray = [];

    const _hrList = _.cloneDeep(this.hRsList);
    _hrList.value.forEach((row) => {
      let item = row;
      if (isForExcel) {
        for (const key in row) {
          let value = row[key];
          if (key == 'date') {
            value = moment(value).format('DD/MM/YY');
          } else if (key == 'dayReportType') {
            value = this.hRsTypes.find((type) => type.Id == value).value;
          }
          item[this.hebrewTitles[key]] = value;
          delete item[key];
        }
      }
      hRsArray.push(row);
    });
    return hRsArray;
  }

  addSelction() {
    this.openDialog(true);
  }

  toggleEdit(enableEdit) {
    this.hRsList.controls.forEach((ctrl) => {
      for (const field in ctrl.value) {
        enableEdit ? ctrl.get(field).enable() : ctrl.get(field).disable();
      }
    });

    this.isReadonly = !enableEdit;
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

  printPage() {
    if (this.searchMode) {
      const search: any = {};
      search.employeeNumber = this._currentSearch.employeeNumber;
      search.month = this._currentSearch.month;
      search.year = this._currentSearch.year;
      this.printService.printDocument(
        'search-print',
        Object.values(search).join()
      );
    } else {
      this.printService.printDocument(
        'report-print',
        this.currentEmployee.employeeNumber
      );
    }
  }
}

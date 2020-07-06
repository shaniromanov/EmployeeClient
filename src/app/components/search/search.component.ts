import { Component, OnInit } from '@angular/core';
import { HoursReportService } from 'src/app/services/hours-report.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/models/employee';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { HoursReport } from 'src/app/models/hoursReport';
import { MatOptionSelectionChange } from '@angular/material/core';
import { PrintService } from 'src/app/services/print.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  currentSearch: { employeeNumber: number; month: string; year: string };
  years = [];
  monthes = [
    { value: 1, text: 'ינואר' },
    { value: 2, text: 'פברואר' },
    { value: 3, text: 'מרץ' },
    { value: 4, text: 'אפריל' },
    { value: 5, text: 'מאי' },
    { value: 6, text: 'יוני' },
    { value: 7, text: 'יולי' },
    { value: 8, text: 'אוגוסט' },
    { value: 9, text: 'ספטמבר' },
    { value: 10, text: 'אוקטובר' },
    { value: 11, text: 'נובמבר' },
    { value: 12, text: 'דצמבר' },
  ];
  searchForm: FormGroup = this.fb.group({
    employeeNumber: '',
    month: '',
    year: '',
  });
  searchControl = new FormControl();
  employees: Employee[] = [];
  filteredEmployees: Observable<{ value: number; text: string }[]>;
  monthlyHRs: HoursReport[];
  printMode: boolean;

  constructor(
    private hoursReportService: HoursReportService,
    private empService: EmployeeService,
    private printService: PrintService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig.path.includes('search-print')) {
      this.printMode = true;
      const searchParams = this.route.snapshot.paramMap.get('search');
      this.searchForm.setValue({
        employeeNumber: +searchParams.split(',')[0],
        year: searchParams.split(',')[2],
        month: searchParams.split(',')[1],
      });
      this.onSearch();
      return;
    }

    this.empService.getEmployees().subscribe((emps: Employee[]) => {
      this.employees = emps;
    });

    let year = 2015;
    while (year <= new Date().getFullYear()) {
      this.years.push(year.toString());
      year++;
    }

    this.subscribeToSearchControl();
  }

  subscribeToSearchControl() {
    this.filteredEmployees = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterEmployees(value))
    );
  }

  private _filterEmployees(value: any): { value: number; text: string }[] {
    const filterValue = (value.text || value).toLowerCase();

    return this.employees
      .filter((emp) => this.fullName(emp).toLowerCase().includes(filterValue))
      .map((filteredEmp) => {
        return {
          text: this.fullName(filteredEmp),
          value: filteredEmp.employeeNumber,
        };
      });
  }

  onSearch() {
    if (!this.searchForm.valid) return;
    this.hoursReportService
      .getMonthlyHrsForEmployee(this.searchForm.value)
      .subscribe((res: HoursReport[]) => {
        this.monthlyHRs = res;
        this.currentSearch = { ...this.searchForm.value };
      });
  }

  fullName(emp: Employee) {
    return emp.firstName + ' ' + emp.lastName;
  }

  display(value) {
    return value?.text;
  }

  onSearchChanged(event: MatOptionSelectionChange) {
    this.searchForm.get('employeeNumber').setValue(event.source.value.value);
  }
}

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EmployeesTableDataSource } from './employees-table-datasource';
import { Employee } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';


@Component({
  selector: 'app-employees-table',
  templateUrl: './employees-table.component.html',
  styleUrls: ['./employees-table.component.scss'],
})
export class EmployeesTableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<Employee>;
  dataSource: EmployeesTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['fullName', 'tz', 'email', 'phone', 'image', 'actions'];
  constructor(private empService: EmployeeService, private route: ActivatedRoute,
    private router: Router, public dialog: MatDialog


  ) { }

  ngOnInit() {
    this.dataSource = new EmployeesTableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
     this.empService.getEmployees().subscribe((emps: Employee[]) => {
      this.dataSource.addData(emps);
      });
  }
 
  openDialog(isOK, isNew?): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '350px',
      data: {
        title:  'מחיקה עובד/ת: '    ,
        content: isOK ? 'הפעולה בוצעה בהצלחה' : 'הפעולה נכשלה',
        okBtn: { value: 'אישור' },
      },
    });

  }

  deleteeEmployee(empNumber) {
    console.log("@@!11@@")
    this.empService.getEmployees().subscribe((emps: Employee[]) => {
      console.log((emps));
      });
    if (empNumber) {
      this.empService
        .removeEmployee(empNumber, {
        })
        .subscribe(
          (emp) => this.openDialog(true, true),
          (err) => {
            this.openDialog(false, true);
          }
        );
        console.log("@@!22@@")
        console.log("@@!22@@")


        this.empService.getEmployees().subscribe((emps: Employee[]) => {
          console.log((emps));
          // this.dataSource.addData(emps);

          
          });
    }
  }
}

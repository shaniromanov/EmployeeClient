import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';
import { Employee } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { OnInit } from '@angular/core';

// TODO: Replace this with your own data model type
export interface EmployeesTableItem {
  name: string;
  id: number;
}

const EMPS: Employee[] = [];

/**
 * Data source for the EmployeesTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class EmployeesTableDataSource extends DataSource<Employee> {
  paginator: MatPaginator;
  sort: MatSort;

  dataStream = new BehaviorSubject<Employee[]>([]);

  set data(v: Employee[]) {
    this.dataStream.next(v);
  }
  get data(): Employee[] {
    return this.dataStream.value;
  }

  constructor() {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Employee[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      this.dataStream,
      this.paginator.page,
      this.sort.sortChange,
    ];

    return merge(...dataMutations).pipe(
      map(() => {
        return this.getPagedData(this.getSortedData([...this.data]));
      })
    );
  }

  addData(newData) {
    const copiedData = this.data.slice();
    copiedData.push(...newData);
    this.data = copiedData;
  }

  removeData(emp/* : Employee */) {
    var index = this.data.indexOf(emp);
    this.data.splice(index, 1);
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: Employee[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: Employee[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'fullName':
          return compare(
            a.firstName + a.lastName,
            b.firstName + b.lastName,
            isAsc
          );
        case 'email':
          return compare(a.email, b.email, isAsc);
        case 'phone':
          return compare(a.phone, b.phone, isAsc);
        case 'employeeId':
          return compare(a.employeeId, b.employeeId, isAsc);
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

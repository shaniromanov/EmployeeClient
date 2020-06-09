import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HoursReportService } from 'src/app/services/hours-report.service';

@Component({
  selector: 'app-add-report-type',
  templateUrl: './add-report-type.component.html',
  styleUrls: ['./add-report-type.component.scss'],
})
export class AddReportTypeComponent implements OnInit {
  newReportTypeList: string[] = [null];

  constructor(
    private hRService: HoursReportService,
    public dialogRef: MatDialogRef<AddReportTypeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  addNewType() {
    this.newReportTypeList.push(null);
  }

  save() {
    this.hRService.addHrsTypes(this.newReportTypeList).subscribe((res) => {});
  }
}

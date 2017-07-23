import { ITableColumn, ITableConfig } from "./tableconfig";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "ng-table",
  templateUrl: "ng-table.component.html",
})
export class NgTableComponent {
  // Table values
  @Input() public rows: any[] = [];
  @Input() public config: ITableConfig;

  // Outputs (Events)
  @Output() public tableChanged: EventEmitter<any> = new EventEmitter();
  @Output() public cellClicked: EventEmitter<any> = new EventEmitter();

  public constructor(private sanitizer: DomSanitizer) {
  }

  public sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private get configColumns(): any {
    const sortColumns: any[] = [];

    this.config.columns.forEach((column: any) => {
      if (column.sort) {
        sortColumns.push(column);
      }
    });

    return { columns: sortColumns };
  }

  public onChangeTable(column: ITableColumn): void {
    this.config.columns.forEach((col: any) => {
      if (col.name !== column.name && col.sort !== false) {
        col.sort = "";
      }
    });
    this.tableChanged.emit({ sorting: this.configColumns });
  }

  public getData(row: any, propertyName: string): string {
    return propertyName.split(".").reduce((prev: any, curr: string) => prev[curr], row);
  }

  public cellClick(row: any, column: any): void {
    this.cellClicked.emit({ row, column });
  }
}

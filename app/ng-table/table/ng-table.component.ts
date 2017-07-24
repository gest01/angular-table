import { COMPONENT_VARIABLE } from "@angular/platform-browser/src/dom/dom_renderer";
import { ITableColumn, ITableConfig } from "./tableconfig";
import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as Rx from "rxjs";

@Component({
  selector: "ng-table",
  templateUrl: "ng-table.component.html",
})
export class NgTableComponent implements OnInit {

  @Input() public config: ITableConfig;

  // Outputs (Events)
  @Output() public tableChanged: EventEmitter<any> = new EventEmitter();
  @Output() public cellClicked: EventEmitter<any> = new EventEmitter();

  public data: any[];

  public constructor(private sanitizer: DomSanitizer) {
  }

  public ngOnInit(): void {
    this.loadData();
  }

  public sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public onChangeTable(column: ITableColumn): void {
    this.config.columns.forEach((col: any) => {
      if (col.name !== column.name && col.sort !== false) {
        col.sort = "";
      }
    });

    this.loadData();
  }

  public getData(row: any, propertyName: string): string {
    return propertyName.split(".").reduce((prev: any, curr: string) => prev[curr], row);
  }

  public cellClick(row: any, column: any): void {
    this.cellClicked.emit({ row, column });
  }

  private loadData(): void {
    const filter = this.getFilter();
    this.config.loader(filter).subscribe((data) => {
      this.data = data;
    });
  }

  private getFilter(): any {
    const filter: any = {};

    const sorting: any = {};
    this.config.columns.forEach((column: any) => {
      if (column.sort) {
        sorting[column.name] = column.sort;
      }

      if (column.filtering && column.filtering.filterString && column.filtering.filterString !== "") {
        filter[column.name] = column.filtering.filterString;
      }

    });

    return {
      page: 2,
      count: 25,
      sorting: sorting,
      filter: filter,
    };
  }
}

import { COMPONENT_VARIABLE } from "@angular/platform-browser/src/dom/dom_renderer";
import { ITableColumn, ITableConfig } from "./tableconfig";
import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import * as Rx from "rxjs";

@Component({
  selector: "ng-table",
  templateUrl: "ng-table.component.html",
})
export class NgTableComponent implements OnInit {

  @Input() public config: ITableConfig;

  @Output() public cellClicked: EventEmitter<any> = new EventEmitter();

  public data: any[];
  public currentPageSize: number;
  public currentPage: number;
  public pages: number[] = [];

  public ngOnInit(): void {
    this.currentPageSize = this.config.defaultPageSize;
    this.currentPage = 1;
    this.loadData();
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
    return row[propertyName];
  }

  public cellClick(row: any, column: any): void {
    this.cellClicked.emit({ row, column });
  }

  public changePageSize(pageSize: number) {
    this.currentPageSize = pageSize;
    this.currentPage = 1;
    this.loadData();
  }

  public changePage(page: number) {
    this.currentPage = page;
    this.loadData();
  }

  private loadData(): void {
    const filter = this.getFilter();
    this.config.getData(filter).subscribe((tableData) => {
      this.data = tableData.data;

      this.pages = [];
      const totalPages = tableData.total / this.currentPageSize;
      const offset = (tableData.total % this.currentPageSize) > 0 ? 1 : 0;
      for (let i = 1; i <= (totalPages + offset); i++) {
        this.pages.push(i);
      }
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
      page: this.currentPage,
      count: this.currentPageSize,
      sorting: sorting,
      filter: filter,
    };
  }
}

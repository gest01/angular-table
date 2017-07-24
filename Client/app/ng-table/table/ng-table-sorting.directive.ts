import { ITableColumn, ITableConfig } from "./tableconfig";
import { Directive, EventEmitter, Input, Output, HostListener } from "@angular/core";

@Directive({ selector: "[ngTableSorting]" })
export class NgTableSortingDirective {

  @Input() public ngTableSorting: ITableConfig;

  @Input() public column: ITableColumn;
  @Output() public sortChanged: EventEmitter<ITableColumn> = new EventEmitter();

  @HostListener("click", ["$event"])
  public onToggleSort(event: any): void {
    if (event) {
      event.preventDefault();
    }

    if (this.column && this.column.enableSorting !== false) {
      switch (this.column.sort) {
        case "asc":
          this.column.sort = "desc";
          break;
        case "desc":
          this.column.sort = "";
          break;
        default:
          this.column.sort = "asc";
          break;
      }

      this.sortChanged.emit(this.column);
    }
  }
}

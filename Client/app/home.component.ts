import { Http } from "@angular/http";
import { ITableConfig, ITableData } from "./ng-table/table/tableconfig";
import * as Rx from "rxjs";
import { Component } from "@angular/core";

@Component({
    selector: "home",
    templateUrl: "home.component.html",
})
export class HomeComponent {

    public page: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 5;
    public numPages: number = 1;
    public length: number = 0;

    public config: ITableConfig = {
        paging: true,
        pagerSizes: [10, 25, 50],
        defaultPageSize: 10,
        showFilterRow: true,
        cssClasses: "table-striped table-bordered table-condensed table-hover",
        filtering: { filterString: "" },
        columns: [
            { title: "ID", name: "id", enableSorting: false },
            { title: "Name", cssClasses: "text-warning", name: "name", filtering: { filterString: "", placeholder: "Filter by name" } },
            {
                title: "Type",
                name: "type",
                filterType: "select",
                filterData: [{ id: 1, name: "f1" }, { id: 2, name: "f2" }, { id: 3, name: "f3" }],
                filtering: { placeholder: "Filter by type" },
            },
            {
                title: "Date From",
                name: "dateFrom",
            },
            {
                title: "Date To",
                name: "dateTo",
            },
        ],
        loader: (filter: any) => {
            console.log(filter);
            return this.http.post("http://localhost:58159/api/values/all", filter)
                .map((response) => response.json() as ITableData);
        },
    };

    public constructor(
        private http: Http,
    ) { }

    public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
    }

    public onCellClick(data: any): any {
        console.log(data);
    }
}
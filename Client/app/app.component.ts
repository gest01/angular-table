import { format } from "url";
import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { ITableConfig, ITableData } from "./ng-table/table/tableconfig";

import "../custom.css";

@Component({
    selector: "my-app",
    templateUrl: "app.component.html",
})
export class AppComponent  {

    public config: ITableConfig = {
        paging: true,
        pagerSizes: [10, 25, 50],
        defaultPageSize: 10,
        showFilterRow: true,
        cssClasses: "table-striped table-bordered table-condensed table-hover",
        filtering: { filterString: "" },
        columns: [
            { title: "ID", name: "id", enableSorting: false },
            { title: "Name", name: "name", filtering: { filterString: "", placeholder: "Filter by name" } },
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
                format: "date",
            },
            {
                title: "Date To",
                name: "dateTo",
                format: "datetime",
            },
        ],
        getData: (filter: any) => {
            console.log(filter);
            return this.http.post("http://localhost:58159/api/values/all", filter)
                .map((response) => response.json() as ITableData);
        },
    };

    public constructor(
        private http: Http,
    ) { }

    public onCellClick(data: any): any {
        console.log(data);
    }
}

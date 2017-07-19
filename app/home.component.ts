import * as Rx from "rxjs";
import { Component } from "@angular/core";

@Component({
    selector: "home",
    templateUrl: "home.component.html",
})
export class HomeComponent {

    public rows: any[] = [];

    public columns: any[] = [
        { title: "ID", name: "id", sort: false, type: "google" },
        { title: "Name", className: "text-warning", name: "name", filtering: { filterString: "", placeholder: "Filter by name" } },
        {
            title: "Type",
            name: "type",
            filterType: "select",
            filterData: [{ id: 1, name: "f1" }, { id: 2, name: "f2" }, { id: 3, name: "f3" }],
            filtering: { placeholder: "Filter by type" },
        },
    ];

    public page: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 5;
    public numPages: number = 1;
    public length: number = 0;

    public config: any = {
        paging: true,
        sorting: { columns: this.columns },
        filtering: { filterString: "" },
        className: ["table-striped", "table-bordered"],
        showFilterRow: true,
    };

    private data: any[];

    public constructor() {
        this.getData().subscribe((data) => {
            this.data = data;
            this.length = data.length;
        });
    }

    public ngOnInit(): void {
        this.onChangeTable(this.config);
    }

    public changePage(page: any, data: any[] = this.data): any[] {
        const start = (page.page - 1) * page.itemsPerPage;
        const end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
        return data.slice(start, end);
    }

    public changeSort(data: any, config: any): any {
        if (!config.sorting) {
            return data;
        }

        const columns = this.config.sorting.columns || [];
        let columnName: string = void 0;
        let sort: string = void 0;

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].sort !== "" && columns[i].sort !== false) {
                columnName = columns[i].name;
                sort = columns[i].sort;
            }
        }

        if (!columnName) {
            return data;
        }

        // simple sorting
        return data.sort((previous: any, current: any) => {
            if (previous[columnName] > current[columnName]) {
                return sort === "desc" ? -1 : 1;
            } else if (previous[columnName] < current[columnName]) {
                return sort === "asc" ? -1 : 1;
            }
            return 0;
        });
    }

    public changeFilter(data: any, config: any): any {
        let filteredData: any[] = data;
        this.columns.forEach((column: any) => {
            if (column.filtering) {
                filteredData = filteredData.filter((item: any) => {

                    if (typeof item[column.name] === "number") {
                        return item[column.name].toString().match(column.filtering.filterString);
                    } else {
                        return item[column.name].match(column.filtering.filterString);
                    }
                });
            }
        });

        if (!config.filtering) {
            return filteredData;
        }

        if (config.filtering.columnName) {
            return filteredData.filter((item: any) =>
                item[config.filtering.columnName].match(this.config.filtering.filterString));
        }

        const tempArray: any[] = [];
        filteredData.forEach((item: any) => {
            let flag = false;
            this.columns.forEach((column: any) => {
                if (item[column.name].toString().match(this.config.filtering.filterString)) {
                    flag = true;
                }
            });
            if (flag) {
                tempArray.push(item);
            }
        });
        filteredData = tempArray;

        return filteredData;
    }

    public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
        if (config.filtering) {
            Object.assign(this.config.filtering, config.filtering);
        }

        if (config.sorting) {
            Object.assign(this.config.sorting, config.sorting);
        }

        const filteredData = this.changeFilter(this.data, this.config);
        const sortedData = this.changeSort(filteredData, this.config);
        this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
        this.length = sortedData.length;
    }

    public onCellClick(data: any): any {
        console.log(data);
    }

    private getData(): Rx.Observable<any[]> {
        return Rx.Observable.of([
            { id: 1, name: "name 1", type: 1 },
            { id: 2, name: "name 2", type: 1 },
            { id: 3, name: "name 3", type: 1 },
            { id: 4, name: "name 4", type: 1 },
            { id: 5, name: "name 5", type: 2 },
            { id: 6, name: "name 6", type: 2 },
            { id: 7, name: "name 7", type: 2 },
            { id: 8, name: "name 8", type: 2 },
            { id: 9, name: "name 9", type: 1 },
            { id: 10, name: "name 10", type: 1 },
            { id: 11, name: "name 11", type: 3 },
            { id: 12, name: "name 12", type: 3 },
            { id: 13, name: "name 13", type: 3 },
            { id: 14, name: "name 14", type: 1 },
            { id: 15, name: "name 15", type: 1 },
            { id: 16, name: "name 16", type: 1 },
            { id: 17, name: "name 17", type: 1 },
            { id: 18, name: "name 18", type: 1 },
            { id: 19, name: "name 19", type: 2 },
            { id: 20, name: "name 20", type: 2 },
            { id: 21, name: "name 21", type: 2 },
            { id: 22, name: "name 22", type: 2 },
            { id: 23, name: "name 23", type: 3 },
            { id: 24, name: "name 24", type: 3 },
            { id: 25, name: "name 25", type: 3 },
            { id: 26, name: "name 26", type: 3 },
            { id: 27, name: "name 27", type: 3 },
            { id: 28, name: "name 28", type: 3 },
            { id: 29, name: "name 29", type: 3 },
            { id: 30, name: "name 30", type: 1 },
            { id: 31, name: "name 31", type: 1 },
            { id: 32, name: "name 31", type: 1 },
        ]);
    }
}
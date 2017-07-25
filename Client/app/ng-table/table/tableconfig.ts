import * as Rx from "rxjs";

export type IDataLoader = (filter: any) => Rx.Observable<ITableData>;

export interface ITableData {
    data: any[];
    total: number;
}

export interface ITableConfig {
    paging: boolean;
    showFilterRow: boolean;
    cssClasses?: string;
    filtering: any;
    columns: ITableColumn[];
    getData: IDataLoader;
    pagerSizes?: number[];
    defaultPageSize?: number;
}

export interface ITableColumn {
    title: string;
    name: string;

    /**
     * select
     */
    filterType?: string;
    filtering?: any;
    filterData?: any[];
    cssClasses?: string;
    sort?: string;
    enableSorting?: boolean;
    format?: string;
}
import * as Rx from "rxjs";

export type IDataLoader = (filter: any) => Rx.Observable<any[]>;

export interface ITableConfig {
    paging: boolean;
    showFilterRow: boolean;
    cssClasses?: string;
    filtering: any;
    columns: ITableColumn[];
    loader: IDataLoader;
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
}
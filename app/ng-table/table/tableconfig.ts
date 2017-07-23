export interface ITableConfig {
    paging: boolean;
    showFilterRow: boolean;
    cssClasses?: string;
    filtering: any;
    columns: ITableColumn[];
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
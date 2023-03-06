import { IRowData } from "./IRowData";

export interface IRowsNode {
    company: string;
    role: string;
    values: IRowData[];
    children?: IRowsNode[];
}
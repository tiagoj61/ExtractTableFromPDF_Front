import { ICompanies } from "./ICompanies";

export interface Report {
    id: string;
    url: string;
    page: string;
    year: string | undefined;
    company: ICompanies;
    createdAt: string | undefined;
}
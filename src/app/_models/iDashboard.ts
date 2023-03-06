import { ICompanyData } from "./ICompanyData"

export interface IDashboard {
    id: number,
    name: string,
    quantity_female: number,
    quantity_male: number,
    year: number
    company: ICompanyData
}

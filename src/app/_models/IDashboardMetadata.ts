export class IDashboardMetadata {

    yearsSet: Set<number>;
    companiesSet: Set<string>;

    constructor(
        private uniqueYearsSet: Set<number>,
        private uniqueCompaniesSet: Set<string>
    ) {
        this.yearsSet = uniqueYearsSet;
        this.companiesSet = uniqueCompaniesSet;
    }

}
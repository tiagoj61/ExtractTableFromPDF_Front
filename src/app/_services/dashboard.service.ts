import { CdkPortal } from '@angular/cdk/portal';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IfStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { IColDetail } from '@app/_models/IColDetail';
import { ICompanyData } from '@app/_models/ICompanyData';
import { IDashboard } from '@app/_models/iDashboard';
import { IDashboardMetadata } from '@app/_models/IDashboardMetadata';
import { IDataTotals } from '@app/_models/IDataTotals';
import { IRowData } from '@app/_models/IRowData';
import { IRowsNode } from '@app/_models/IRowsNode';
import { environment } from '@environments/environment';
import { data, unique } from 'jquery';
import { firstValueFrom, timestamp } from 'rxjs';
import * as XLSX from 'xlsx'

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  constructor(private httpClient: HttpClient) {

  }

  async getDashboardTableData(razaoSocial?: string, ano?: string) {

    let params = new HttpParams();
    if(razaoSocial!=null && razaoSocial.length>0){
      params = params.append('razaoSocial', razaoSocial!);
    }
    if(ano!=null && ano.length>0){
    params = params.append('ano', ano!);
    }

    return firstValueFrom(this.httpClient.get<IDashboard[]>(`${environment.apiUrl}/burdens`, { params: params }));
  }

  getTabMetadata(dashboardData: IDashboard[]) {


    // listar entradas unicas por ano para cada empresa
    let uniqueEntries = dashboardData.filter(function (this: Set<string>, { name, company, year }) {
      let key = `${name}${company.id}${year}`;
      return !this.has(key) && this.add(key);
    }, new Set);

    if (uniqueEntries.length >> 0) {

      let uniqueYears = uniqueEntries.filter(function (this: Set<number>, { year }) {
        let key = year;
        return !this.has(key) && this.add(key);
      }, new Set);

      // filtrar empresas
      let uniqueCompanies = uniqueEntries.filter(function (this: Set<string>, { company }) {
        let key = `${company.name}`;
        return !this.has(key) && this.add(key);
      }, new Set);

      return new IDashboardMetadata(new Set(uniqueYears.map(value => value.year)), new Set(uniqueCompanies.map(value => value.company.name)));

    }
    return new IDashboardMetadata(new Set<number>, new Set<string>);
  }

  getRowsTab(dashboardMetaData: IDashboardMetadata, dashboardData: IDashboard[], colsData: IColDetail[]) {

    // gerar totais x ano x empresa:
    let totalsTab: IDataTotals[] = [];

    dashboardMetaData.companiesSet.forEach((company) => {
      let dataCompFilter = dashboardData.filter((value: IDashboard, array) => {
        return value.company.name == company;
      });

      dashboardMetaData.yearsSet.forEach((year: number) => {
        let dataYearFilter = dataCompFilter.filter((companyDataFiltered: IDashboard) => {
          return companyDataFiltered.year == year;
        });

        let totalLine: IDataTotals = {
          company: "",
          role: "",
          year: "",
          femaleTotal: 0,
          maleTotal: 0,
          femTotPercent: 0,
          maleTotPercent: 0,
          total: 0
        };

        for (let i = 0; i < dataYearFilter.length; i++) {
          const companyLine = dataYearFilter[i];
          totalLine.femaleTotal += companyLine.quantity_female;
          totalLine.maleTotal += companyLine.quantity_male;
          totalLine.total = totalLine.femaleTotal + totalLine.maleTotal;
          totalLine.company = companyLine.company.name;
          totalLine.year = companyLine.year.toString();
        }

        if (totalLine.total != 0) {
          totalLine.femTotPercent = (100 * (totalLine.femaleTotal / totalLine.total));
          totalLine.maleTotPercent = (100 * (totalLine.maleTotal / totalLine.total));
        }

        if (totalLine.company != "" && totalLine.year != "") {
          totalsTab.push(totalLine);
        }
      });
    });

    // loop nas colunas para montar linhas da tabela de acordo com vals dinamicos de coluna
    const rowTotalsTabDataTab: IRowsNode[] = [];

    dashboardMetaData.companiesSet.forEach((companyId) => {

      let offset = 0;
      let rowTotalsTabData: IRowData[] = [];

      for (let i = 0; i < colsData.length; i++) {

        const element = colsData[i];


        switch (element.colPosition) {

          case "0": //nome da empresa
            rowTotalsTabData.push({ value: companyId });
            break;

          case "1": // nome do cargo
            rowTotalsTabData.push({ value: "" });
            break;


          default:
            let rowTotalLine = totalsTab.filter((line: IDataTotals) => {
              return (line.year == element.year.toString() && line.company == companyId.toString());
            }, new Set);

            let x = (i - 2) - (offset * 5);

            switch (x) {
              case 0: //mulheres
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: rowTotalLine[0].femaleTotal });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 1: //mulheres_%
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: Math.round(rowTotalLine[0].femTotPercent).toFixed(2).toString() });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 2: //homens
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: rowTotalLine[0].maleTotal });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 3: //homens_%
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: Math.round(rowTotalLine[0].maleTotPercent).toFixed(2).toString() });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 4: //TOTAL
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: rowTotalLine[0].total });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }

                offset++;
                break;

              default:
                break;
            }
            break;

        }

      }

      // rowTotalsTabDataTab.push(rowTotalsTabData);
      let childrenTab = this.getRowsChildTab(companyId, dashboardMetaData, dashboardData, colsData);
      rowTotalsTabDataTab.push({
        company: companyId.toString(),
        role: "",
        values: rowTotalsTabData,
        children: childrenTab
      });

      rowTotalsTabData = [];

    });

    return rowTotalsTabDataTab;

  }

  getRowsChildTab(companyId: string, dashboardMetaData: IDashboardMetadata, dashboardData: IDashboard[], colsData: IColDetail[]): IRowsNode[] {


    let rowsChildTab: IRowsNode[] = [];
    let totalsTab: IDataTotals[] = [];

    // get all entries by company
    let dataByCompany = dashboardData.filter((data: IDashboard) => {
      return data.company.name == companyId;
    });

    // calculate total per each year for every role
    for (let i = 0; i < dataByCompany.length; i++) {
      const dataLine = dataByCompany[i];

      // find all entries for the same role and smae company
      let sameRoleData = dataByCompany.filter((roleData) => {
        return roleData.name == dataLine.name;
      });

      dashboardMetaData.yearsSet.forEach((year: number) => {
        let dataYearFilter = sameRoleData.filter((companyDataFiltered: IDashboard) => {
          return companyDataFiltered.year == year;
        });

        if (dataYearFilter.length == 0) {
          return;
        }

        let totalLine: IDataTotals = {
          company: dataYearFilter[0].company.name,
          role: "",
          year: "",
          femaleTotal: 0,
          maleTotal: 0,
          femTotPercent: 0,
          maleTotPercent: 0,
          total: 0
        };

        for (let i = 0; i < dataYearFilter.length; i++) {
          const companyLine = dataYearFilter[i];
          totalLine.femaleTotal += companyLine.quantity_female;
          totalLine.maleTotal += companyLine.quantity_male;
          totalLine.total += totalLine.femaleTotal + totalLine.maleTotal;
          totalLine.company = companyLine.company.name;
          totalLine.year = companyLine.year.toString();
          totalLine.role = companyLine.name;
        }

        if (totalLine.total != 0) {
          totalLine.femTotPercent = (100 * (totalLine.femaleTotal / totalLine.total));
          totalLine.maleTotPercent = (100 * (totalLine.maleTotal / totalLine.total));
        }

        if (totalLine.company != "" && totalLine.year != "") {
          totalsTab.push(totalLine);
        }
      });
    };

    // com os totais calculados do cargo monta linha do cargo
    let uniqueRolesList = totalsTab.filter(function (this: Set<string>, { role }) {
      let key = `${role}`;
      return !this.has(key) && this.add(key);
    }, new Set);

    uniqueRolesList.forEach((uniqueRoles) => {

      let offset = 0;
      let rowTotalsTabData: IRowData[] = [];

      for (let i = 0; i < colsData.length; i++) {

        const element = colsData[i];

        switch (element.colPosition) {

          case "0": //nome da empresa
            rowTotalsTabData.push({ value: companyId });
            break;

          case "1": // nome do cargo
            rowTotalsTabData.push({ value: uniqueRoles.role });
            break;


          default:
            let rowTotalLine = totalsTab.filter((line: IDataTotals) => {
              return (line.year == element.year.toString() && line.company == companyId.toString() && line.role == uniqueRoles.role);
            }, new Set);

            let x = (i - 2) - (offset * 5);

            switch (x) {
              case 0: //mulheres
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: rowTotalLine[0].femaleTotal });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 1: //mulheres_%
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: Math.round(rowTotalLine[0].femTotPercent).toFixed(2).toString() });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 2: //homens
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: rowTotalLine[0].maleTotal });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 3: //homens_%
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: Math.round(rowTotalLine[0].maleTotPercent).toFixed(2).toString() });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }
                break;

              case 4: //TOTAL
                if (rowTotalLine.length != 0) {
                  rowTotalsTabData.push({ value: rowTotalLine[0].total });
                } else {
                  rowTotalsTabData.push({ value: 0 });
                }

                offset++;
                break;

              default:
                break;
            }
            break;
        }

        if (i == (colsData.length - 1)) {
          rowsChildTab.push({
            company: companyId.toString(),
            role: uniqueRoles.role,
            values: rowTotalsTabData,
          });
          rowTotalsTabData = [];
        }
      }

    });

    return rowsChildTab;
  }

  downloadData(dataSel: number[], cols: IColDetail[], tableData: IRowsNode[]) {


    // flatten dataSource
    let flatenData: IRowsNode[] = [];
    let counter = 0;

    tableData.forEach((linesParent) => {
      // counter is in the selction list?
      if (!dataSel.includes(counter)) {
        counter++;
        return;
      }
      flatenData.push(
        {
          company: linesParent.company,
          role: linesParent.role,
          values: linesParent.values
        }
      );
      counter++;

      if (linesParent.children?.length == undefined || linesParent.children?.length > 0) {
        linesParent.children?.forEach((linesChild) => {

          if (!dataSel.includes(counter)) {
            counter++;
            return;
          }

          flatenData.push(
            {
              company: linesChild.company,
              role: linesChild.role,
              values: linesChild.values
            }
          )
          counter++;
        });
      }
    });


    // mount cols
    let colTab: string[] = [];
    for (let i = 0; i < cols.length; i++) {
      const colLine = cols[i];

      if (i > 1) {
        colTab.push(`${colLine.colName}${i}(${colLine.year})`);
      } else {
        colTab.push(colLine.colName);
      }
    };

    // mount lines
    let jsonObj: any[] = [];
    // dataSel.forEach((dataLine) => {
    flatenData.forEach((dataLine) => {

      let item: { [index: string]: any } = {};

      for (let i = 0; i < colTab.length; i++) {
        const colLine = colTab[i];
        if (i == 0) {
          item[colTab[i]] = dataLine.company;
        } else if (i == 1) {
          item[colTab[i]] = dataLine.role;
        } else {
          item[colTab[i]] = dataLine.values[i].value.toString();
        }
      }

      jsonObj.push(item);
    });


    // get data from selection
    const workSheet = XLSX.utils.json_to_sheet(jsonObj, { header: colTab });
    // const workSheet = XLSX.utils.json_to_sheet(dataSel, { header: colTab });
    // const workSheet = XLSX.utils.json_to_sheet(dataSel);
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'sheet1');
    XLSX.writeFile(workBook, `dashboard_${(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace(/[^0-9]/g, "")}.xlsx`);

  }
}
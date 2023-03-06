import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Burden } from '@app/_models/burden';
import { IColDetail } from '@app/_models/IColDetail';
import { IDashboard } from '@app/_models/iDashboard';
import { IRowData } from '@app/_models/IRowData';
import { IRowsNode } from '@app/_models/IRowsNode';
import { AlertService } from '@app/_services';
import { DashboardService } from '@app/_services/dashboard.service';


interface RowsNode {
  company: string;
  role: string;
  values: IRowData[];
  count?: number;
  children?: RowsNode[];
}

interface ExampleFlatRowsNode {
  expandable: boolean;
  company: string;
  role: string;
  values: IRowData[];
  level: number;
}

interface IDashboardCollumnDetails {
  colname: string;
}

const DASHBOARD_COL_DETAILS: IDashboardCollumnDetails[] = [
  { colname: 'Mulheres' },
  { colname: '%' },
  { colname: 'Homens' },
  { colname: '%' },
  { colname: 'TOTAL' }
];

interface IROW_DATA {
  // colPosition: string;
  value: string | number;
}

const ROW_DATA: IROW_DATA[][] = [
  [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  [{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
]

const DASHBOARD_DATA: IDashboard[] = [
  {
    company: { id: 1, name: "Nubank" },
    id: 1,
    name: 'Gerencia',
    quantity_female: 10,
    quantity_male: 7,
    year: 2022
  },
  {
    company: { id: 1, name: "Nubank" },
    id: 2,
    name: 'Diretoria',
    quantity_female: 2,
    quantity_male: 1,
    year: 2022
  },
  {
    company: { id: 1, name: "Nubank" },
    id: 3,
    name: 'Analista',
    quantity_female: 100,
    quantity_male: 230,
    year: 2022
  },
  {
    company: { id: 1, name: "Nubank" },
    id: 1,
    name: 'Gerencia',
    quantity_female: 10,
    quantity_male: 7,
    year: 2021
  },
  {
    company: { id: 1, name: "Nubank" },
    id: 2,
    name: 'Analista',
    quantity_female: 90,
    quantity_male: 180,
    year: 2021
  },
  {
    company: { id: 1, name: "Nubank" },
    id: 1,
    name: 'Diretoria',
    quantity_female: 1,
    quantity_male: 1,
    year: 2021
  },
  {
    company: { id: 2, name: "Banco PAN" },
    id: 1,
    name: 'Diretoria',
    quantity_female: 1,
    quantity_male: 4,
    year: 2020
  },
  {
    company: { id: 2, name: "Banco PAN" },
    id: 2,
    name: 'Analistas',
    quantity_female: 500,
    quantity_male: 650,
    year: 2021
  }
];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  myControl = new FormControl<string>('');


  displayedColumns!: string[];
  dispColsDetails: IColDetail[] = [
    { colPosition: "0", colName: "Empresa", year: 0 },
    { colPosition: "1", colName: "Cargo", year: 0 }];
  colsDetIds: string[] = [];

  // selection = new SelectionModel<IRowsNode>(true, []);
  selection = new SelectionModel<number>(true, []);

  private transformerRowNode = (node: RowsNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      company: node.company,
      role: node.role,
      values: node.values,
      level: level,
    };
  };

  treeRowControl = new FlatTreeControl<ExampleFlatRowsNode>(
    node => node.level,
    node => node.expandable);

  treeRowFlattener = new MatTreeFlattener(
    this.transformerRowNode,
    node => node.level,
    node => node.expandable,
    node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeRowControl, this.treeRowFlattener);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private dashboardService: DashboardService,
  ) {
    this.form = this.formBuilder.group({
      // name: ['', Validators.required],
      name: [''],
      // year: ['', Validators.required],
      year: [''],
    });

  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {

  }

  consultarClick() {
    this.loading = true;
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      console.log('form invalido');
      return;
    }

    this.loading = true;

    // var counter = this.dispColsDetails.length;

    // // this.dataSource.data = DASHBOARD_DATA;
    // let dashboardData = DASHBOARD_DATA; // get from service
    // let dashboardMetaData = this.dashboardService.getTabMetadata(dashboardData);
    // let yearsArray = Array.from(dashboardMetaData.yearsSet).sort((n1, n2) => n1 - n2);
    // this.displayedColumns = yearsArray.map(String);
    // this.displayedColumns.unshift("Empresa"); // coluna de empresa no inicio

    // for (let i = 0; i < yearsArray.length; i++) {
    //   for (let j = 0; j < DASHBOARD_COL_DETAILS.length; j++) {
    //     this.dispColsDetails.push({ colPosition: (counter).toString(), colName: DASHBOARD_COL_DETAILS[j].colname, year: yearsArray[i] });
    //     counter++;
    //   }
    // };

    // this.colsDetIds = this.dispColsDetails.map(c => c.colPosition);
    // let rawRowsTabData = this.dashboardService.getRowsTab(dashboardMetaData, DASHBOARD_DATA, this.dispColsDetails);
    // this.dataSource.data = rawRowsTabData;

    this.dashboardService.getDashboardTableData(
      this.f['name'].value,
      this.f['year'].value
    ).then(response => {

      var counter = this.dispColsDetails.length;
      this.dispColsDetails = [
        { colPosition: "0", colName: "Empresa", year: 0 },
        { colPosition: "1", colName: "Cargo", year: 0 }];
      // this.dataSource.data = DASHBOARD_DATA;
      // let dashboardData = DASHBOARD_DATA; // get from service
      let dashboardMetaData = this.dashboardService.getTabMetadata(response);
      let yearsArray = Array.from(dashboardMetaData.yearsSet).sort((n1, n2) => n1 - n2);
      this.displayedColumns = yearsArray.map(String);
      this.displayedColumns.unshift("Empresa"); // coluna de empresa no inicio

      for (let i = 0; i < yearsArray.length; i++) {
        for (let j = 0; j < DASHBOARD_COL_DETAILS.length; j++) {
          this.dispColsDetails.push({ colPosition: (counter).toString(), colName: DASHBOARD_COL_DETAILS[j].colname, year: yearsArray[i] });
          counter++;
        }
      };

      this.colsDetIds = this.dispColsDetails.map(c => c.colPosition);
      let rawRowsTabData = this.dashboardService.getRowsTab(dashboardMetaData, response, this.dispColsDetails);
      this.dataSource.data = rawRowsTabData;

    }
    ).catch(error => console.error(error));
  }

  hasChild = (_: number, node: ExampleFlatRowsNode) => node.expandable;

  clearDashboardTab() { };

  downloadData() {
    this.dashboardService.downloadData(this.selection.selected, this.dispColsDetails, this.dataSource.data);
  };

  rowCheckToggle(node: number) {
    this.selection.toggle(node);
    console.log(this.selection);
  };

  getRowsTotLines() {
    let total: number = 0;

    for (let i = 0; i < this.dataSource.data.length; i++) {
      const dataSourceLine = this.dataSource.data[i];
      total += 1;
      if (dataSourceLine.children?.length == 0 || undefined) {
        continue;
      } else {
        let dataSourceChildren = dataSourceLine.children;
        for (let j = 0; j < dataSourceChildren!.length; j++) {
          total += 1;
        }
      }
    }

    return total;

  }

  toggleAll() {
    let counter = 0;
    if (this.selection.selected.length == this.getRowsTotLines() && this.selection.hasValue()) {
      this.selection.clear();
    } else {

      this.dataSource.data.forEach((lineFather) => {
        this.selection.select(counter);
        counter += 1;
        lineFather.children?.forEach((lineChild) => {
          this.selection.select(counter);
          counter += 1;
        })
      });

    }

    console.log(this.selection);

  }

  isRowSelected(row: number) {
    return this.selection.isSelected(row);
  }

}
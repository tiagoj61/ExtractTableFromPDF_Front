import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { RazaoSocialGroup } from './razao-social-group';
import { map, startWith } from 'rxjs/operators';
import { RazaoSocialService } from '@app/_services/razao-social.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ICompanies } from '@app/_models/ICompanies';
import Swal from 'sweetalert';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@app/_services';

@Component({
  selector: 'app-empresas-consulta',
  templateUrl: './empresas-consulta.component.html',
  styleUrls: ['./empresas-consulta.component.css']
})

export class EmpresasConsultaComponent implements OnInit, AfterViewInit {

  myControl = new FormControl<string | RazaoSocialGroup>('');
  options: RazaoSocialGroup[] = [{ razaoSocial: 'Nubank' }, { razaoSocial: 'Itaú' }, { razaoSocial: 'Bradesco' }];
  filteredOptions!: Observable<RazaoSocialGroup[]>;

  displayedColumns: string[] = ['name', 'acao'];
  dataSource = new MatTableDataSource<ICompanies>();

  @ViewChild(MatPaginator)
  paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private razaoSocialService: RazaoSocialService,
    private alertService: AlertService,
  ) {
    // razaoSocialService.getAll().then(x => {
    //   this.dataSource.data = x
    // });

  };

  ngOnInit() {
    this.razaoSocialService.getAll()
    .then(companies => {
      this.dataSource.data = companies;
    });
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.razaoSocial;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );
  }

  displayFn(razaoSocial: RazaoSocialGroup): string {
    return razaoSocial && razaoSocial.razaoSocial ? razaoSocial.razaoSocial : '';
  }

  private _filter(razaoSocial: string): RazaoSocialGroup[] {
    const filterValue = razaoSocial.toLowerCase();

    return this.options.filter(option => option.razaoSocial.toLowerCase().includes(filterValue));
  }

  onClick() {
  }

  exibirTudoClick() {

    // todo: passar retorno do exibir tudo para a data table
    this.razaoSocialService.getAll()
      .then(companies => console.log(companies))
      .catch(error => console.error(error));
  }
  edit(id: any) {
    Swal({
      title: "Atenção!",
      text: "Deseja realmente editar essa empresa?",
      icon: "warning",
      buttons: ['Cancel', 'Ok'],
      dangerMode: true,
    })
      .then((resp) => {
        if (resp) {
          this.router.navigate(["/empresas"], {
            queryParams: { id: id },
            queryParamsHandling: "merge",
            preserveFragment: true
          })
        }
      });
  }
  delete(id: any) {
    Swal({
      title: "Atenção!",
      text: "Deseja realmente deletar essa empresa?",
      icon: "warning",
      buttons: ['Cancel', 'Ok'],
      dangerMode: true,
    })
      .then((resp) => {
        if (resp) {
          
          let company = this.razaoSocialService.delete(
            id
          );
      
          company.subscribe(data => location.reload() ,
            error => this.alertService.error('No momento o sistema de extração se encontra indisponivel!')
            );
        }
      });
  }

}



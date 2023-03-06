import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AlertService } from '@app/_services';
import { RazaoSocialService } from '@app/_services/razao-social.service';
import {first, map} from "rxjs/operators";
import Swal from 'sweetalert';
@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
butname:string='Cadastrar';
  form!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  idPatah: any;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private razaoSocialService: RazaoSocialService,
    private alertService: AlertService,
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.idPatah = this.route.snapshot.queryParamMap.get('id');
    if (this.idPatah != null) {
      this.butname='Editar';
      //Se for um edit
      let company = this.razaoSocialService.getCompany(
        this.idPatah
      );
      company.subscribe(data => {
        this.form = this.formBuilder.group({
          name: [data.name, Validators.required],
        });
      },
    
        () =>
          this.alertService.error('Server indisponivel no momento!')
      );
    }
  }

  onClick() {

  }
  cadastrarClick() {
    this.loading = true;
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      console.log('form invalido');
      return;
    }
    Swal({
      title: "Atenção!",
      text: `Deseja realmente ${this.butname.toLowerCase()} essa empresa?`,
      icon: "warning",
      buttons: ['Cancel', 'Ok'],
      dangerMode: true,
    })
      .then((resp) => {
        this.loading = true;
    if (this.idPatah != null) {
     let company = this.razaoSocialService.editCompani(
      this.idPatah,
      this.f['name'].value,
      );
      company.subscribe(x => {
        this.router.navigate(["/empresasconsulta"]);
      });
    }else{
    let company = this.razaoSocialService.insertCompany(this.f['name'].value);
    company.subscribe(x => {
      this.router.navigate(["/empresasconsulta"]);
    });
  }
  
      });
  

}}

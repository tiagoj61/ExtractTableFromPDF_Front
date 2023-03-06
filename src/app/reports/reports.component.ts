import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@app/_services';
import { RazaoSocialService } from "@app/_services/razao-social.service";
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import Swal from 'sweetalert';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  myControl = new FormControl<string>('');
  idPatah: any;
  id:any;
  curUser: any;
  companis = [{ name: "itau", id: 1 }, { name: "Nubanl", id: 2 }]
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private razaoSocialService: RazaoSocialService,
  ) {
    this.form = this.formBuilder.group({
      compni: ['', Validators.required],
      pagNum: ['', Validators.required],
      link: ['', Validators.required],
      year: ['', Validators.required],
    });
  }
  setNewUser(user: any): void {
    console.log(user);
    this.curUser = user;
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.razaoSocialService.getAll()
      .then(companies => {
        this.companis = companies;
      })
      .catch(error => console.error(error));

      console.log(this.idPatah)
  }

  cadastrarClick() {
    if (this.form.invalid) {
      console.log('form invalido');
      return;
    }
    console.log(this.idPatah)
    Swal({
      title: "Atenção!",
      text: "Deseja realmente solicitar essa extração?",
      icon: "warning",
      buttons: ['Cancel', 'Ok'],
      dangerMode: true,
    })
      .then((resp) => {
        if (resp) {
         
            this.loading = true;
            this.submitted = true;
            this.alertService.clear();

            this.loading = true;
            let company: any;
            console.log(this.idPatah)
   
              company = this.razaoSocialService.requestExtraction(
                this.f['compni'].value,
                this.f['link'].value,
                this.f['pagNum'].value,
                this.f['year'].value
              );
            

            company.subscribe(() => {
              Swal("Documento salvo e enviado para extração!", {
                icon: "success",
              }).then((r) => {
                this.router.navigate(["/empresasconsulta"]) })
              },
              () => this.alertService.error('No momento o sistema de extração se encontra indisponivel!')
            );
         
        }
      });


  }
  clearFields() {
    this.form.reset();
  }
}

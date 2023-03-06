import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { EmpresasConsultaComponent } from './empresas-consulta/empresas-consulta.component';
import { HomeComponent } from './home';
import { ReportsComponent } from './reports/reports.component';
import { AuthGuard } from './_helpers';
import { DashboardComponent } from './dashboard/dashboard.component';

const accountModule = () => import('./components/account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./components/users/users.module').then(x => x.UsersModule);


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
  { path: 'account', loadChildren: accountModule },
  { path: 'empresas', component: EmpresasComponent, canActivate: [AuthGuard] },
  { path: 'empresasconsulta', component: EmpresasConsultaComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICompanies } from '@app/_models/ICompanies';
import {API_COMPANIES_PATH, environment} from '@environments/environment';
import { firstValueFrom } from 'rxjs';
import {User} from "@app/_models";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RazaoSocialService {

  constructor(
    private httpClient: HttpClient

  ) { }

  insertCompany(name: String) {
    return this.httpClient.post<User>(`${environment.apiUrl}/companies`, {name});
  }

  async upadteCompany(id: number) {

  }
  getCompany(companyId: number) {
    return this.httpClient.get<ICompanies>(`${environment.apiUrl}/companies/${companyId}`);
  }
  editCompani(companyId: number, url: String) {
    return this.httpClient.put<User>(`${environment.apiUrl}/companies/${companyId}/${url}`,{});
  }
  edit(companyId: number, url: String, page: number, year: number) {
    return this.httpClient.put<User>(`${environment.apiUrl}/companies/${companyId}/request`, {url, page, year});
  }
  delete(companyId: number) {
    return this.httpClient.delete<User>(`${environment.apiUrl}/companies/${companyId}`);
  }
  requestExtraction(companyId: number, url: String, page: number, year: number) {
    return this.httpClient.post<User>(`${environment.apiUrl}/companies/${companyId}/request`, {url, page, year});
  }

  async getAll() {
    return firstValueFrom(this.httpClient.get<ICompanies[]>(`${environment.apiUrl}/companies`));
  }

}

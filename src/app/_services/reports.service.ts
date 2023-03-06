import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Report } from '@app/_models/report';
import { environment } from '@environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(
    private httpClient: HttpClient

  ) { }

  requestExtraction(companyId: number, url: String, page: number, year: number) {
    // return this.httpClient.post<User>(`${environment.apiUrl}/reports/${companyId}/request`, {url, page, year});
  }

  async getList(name: string, year: number) {
    let params = new HttpParams();
    params = params.append('year', year);
    params = params.append('companyId', name);

    return firstValueFrom(this.httpClient.get<Report[]>(`${environment.apiUrl}/companies/requests`, { params: params }));
  }

  async getById() {
    //todo
  }
}

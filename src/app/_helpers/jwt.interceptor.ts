import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_COMPANIES_PATH, environment } from '@environments/environment';
import { AccountService } from '@app/_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const user = this.accountService.userValue;
        const isLoggedIn = user && user.token;
        const isApiUrl = request.url.startsWith(environment.apiUrl);
        if (isLoggedIn && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Basic ${user.token}`
                }
            });
        }


        const isCompaniesURL = request.url.startsWith(API_COMPANIES_PATH)
        if (isCompaniesURL) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Basic ` + window.btoa(`admin@fin4she.co:admin`)
                }
            });
        }


        return next.handle(request);
    }
}

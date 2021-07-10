import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  isAuth = false;
  token = "af88bcc96e7efcf7297a6f9207893c6fc3dcbd56";

  getHeaders(options?: Object) {
    const headers: any = {
      // 'Content-Type': 'application/json'
      // responseType: 'text' as const,
    };

    headers['Authorization'] = `${this.token}`;

    return headers
  };
  
  constructor(
    public http: HttpClient
  ) { }
}
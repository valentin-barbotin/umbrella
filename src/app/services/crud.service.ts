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
  token = "";

  getHeaders(options?: Object) {
    const headers:any = {
      // 'Content-Type': 'application/json'
      responseType: 'json' as const,
    };

    if (this.token != "") {
      console.log("ajout token header")
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      console.log("pas de token")
    }

    return headers
  };
  
  GET(endpoint: string) {
    return this.http.get<any[]>(
      environment.api+endpoint,
      {headers: new HttpHeaders(this.getHeaders())}
      );
  }

  POST(endpoint: string, data: Object, options?: Object) {

    return this.http.post<any[]>(
      environment.api+endpoint,
      data,
      {
        headers: new HttpHeaders(this.getHeaders(options)),
        reportProgress: true,
        withCredentials: true,
        // observe: 'events'
      }
      );
  }

  DELETE(endpoint: string) {
    return this.http.delete<any[]>(
      environment.api+endpoint,
      {headers: new HttpHeaders(this.getHeaders())}
      );
  }
  
  constructor(
    public http: HttpClient
  ) { }
}
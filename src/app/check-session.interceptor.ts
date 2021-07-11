import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CheckSessionInterceptor implements HttpInterceptor {

  constructor(
  ) {}
    
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log(123);

    const token = "af88bcc96e7efcf7297a6f9207893c6fc3dcbd56";
    const authReq = request.clone({
      setHeaders: { Authorization: token }
    });

    return next.handle(authReq);
  }
  
}

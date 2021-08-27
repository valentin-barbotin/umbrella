import { Injectable } from '@angular/core'
@Injectable({
    providedIn: 'root'
})
export class CrudService {
  isAuth = false;
  token = 'af88bcc96e7efcf7297a6f9207893c6fc3dcbd56';

  getHeaders (options?: Object) {
      const headers: any = {

      /*
       * 'Content-Type': 'application/json'
       * responseType: 'text' as const,
       */
      }

      headers.Authorization = `${this.token}`

      return headers
  }
}

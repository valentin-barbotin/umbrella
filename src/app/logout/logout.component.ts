import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { CrudService } from '../services/crud.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.sass']
})
export class LogoutComponent implements OnInit {

  constructor(
    private Router: Router,
    private http: HttpClient,
    private CrudService: CrudService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    const exist = localStorage.getItem('user')
    if (!exist) {
      this.Router.navigate(['/'])
      return
    }

    localStorage.removeItem('user')
    this.cookieService.delete('connect.sid')

    this.http.get(
      `${environment.api}users/logout`,
      {
        // headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          console.log(response)
          if (response) {
            this.Router.navigate(['/'])
          }
        },
        (error) => {
          console.log(error)
        }
      )

  }

}

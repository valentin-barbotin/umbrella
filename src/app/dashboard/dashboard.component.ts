import { Component, Input, OnInit } from '@angular/core'
import { UserService } from '../services/user.service'
import { Router } from '@angular/router'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { FileService } from '../services/file.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  @Input() val: string = '';

  mode: string = ''

  get User () {
    return this.UserService.User
  }

  constructor (
    private UserService: UserService,
    private http: HttpClient,
    public FileService: FileService,
    private Router: Router
  ) {
    this.http.get(
      `${environment.api}users/check`,
      {
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
      },
      (error: HttpErrorResponse) => {
        const user = localStorage.getItem('user')
        if (error.status === 401 || !user) {
          localStorage.removeItem('user')
          this.Router.navigate(['/'])
        }
      }
    )
  }

  ngOnInit (): void {
  }
}

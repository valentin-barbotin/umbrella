import { Component, Input, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  @Input() val: string = "";

  mode: string = ""

  get User() {
    return this.UserService.User;
  }

  constructor(
    private UserService: UserService,
    private Router: Router,
    private http: HttpClient,
    ) {

    this.http.get(
      `${environment.api}users/check`,
    {
      reportProgress: true,
      withCredentials: true,
    }
    ).subscribe(
      (response) => {
        console.log('got a response from users check');
        
      },
      (error: HttpErrorResponse) => {
        
        const user = localStorage.getItem('user');
        console.log('check user on error');
        console.log(user);
        if (error.status == 401 || !user) {
          console.log('remove storage and redirect');
          
          localStorage.removeItem('user');
          this.Router.navigate(['/'])
        }
      }
    );

  }

  ngOnInit(): void {
  }

}

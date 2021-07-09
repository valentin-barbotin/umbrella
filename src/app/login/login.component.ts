import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CrudService } from '../services/crud.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  hide1 = true;

  get login() {
    return this.loginForm.get('login');
  }
  get password() {
    return this.loginForm.get('password');
  }

  auth() {

    const form = new FormData();
    for (const input in this.loginForm.controls) {
      form.append(input, this.loginForm.get(input)?.value);
    }
    this.http.post<User>(
      `${environment.api}users/login`,
      form,
      {
        headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          console.log(response)
          if (response) {
            localStorage.setItem('user', JSON.stringify(response));
            this.Router.navigate(['/'])
          }
        },
        (error) => {
          console.log(error)
        }
      )
  }

  ngOnInit(): void {
    const exist = localStorage.getItem('user')
    if (exist) {
      alert('Already connected')
      this.Router.navigate(['/'])
    }
  }

  constructor(
    private CrudService: CrudService,
    private http: HttpClient,
    private Router: Router,
  ) {}
}

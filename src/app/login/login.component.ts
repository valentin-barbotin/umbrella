import { Component, OnInit, HostBinding } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CrudService } from '../services/crud.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../user';
import { Router } from '@angular/router';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  animations: [
    trigger('connect', [
      state('failed', style({
        color: 'red'
      })),
      state('connected', style({
        color: 'green'
      })),
      transition('* => *', [
        animate('0.5s')
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  connecting = true;

  authButton = 'Login'
  state = "ready";

  toggle() {
    this.connecting = !this.connecting;
  }

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
    this.state = "progress"
    this.authButton = "Auth.."

    function failed(component: LoginComponent) {
      component.authButton = 'Authentication failed'
      component.state = "failed"
      setTimeout(() => {
        component.authButton = 'Login'
        component.state = "ready"
      }, 3000);
    }

    this.http.post<User>(
      `${environment.api}users/login`,
      form,
      {
        // headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          if (response) {
            localStorage.setItem('user', JSON.stringify(response));
            this.state = "connected";
            this.authButton = 'Connected !'
            setTimeout(() => {
              this.Router.navigate(['/'])
            }, 3000);
          } else {
            failed(this)
          }
        },
        (error) => {
          failed(this)
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
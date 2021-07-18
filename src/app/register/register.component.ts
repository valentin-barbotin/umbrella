import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password1: new FormControl('', [Validators.required]),
    password2: new FormControl('', [Validators.required]),
  });

  get username() { return this.registerForm.get('username') }
  get email() { return this.registerForm.get('email') }
  get password1() {return this.registerForm.get('password1') }
  get password2() {return this.registerForm.get('password2') }

  authButton = 'Register'
  state = "ready";

  hide1 = true;
  hide2 = true;

  register(form: FormGroupDirective) {

    if (['registred','failed'].includes(this.state)) return

    if (this.password1?.value != this.password2?.value) return

    function failed(component: RegisterComponent) {
      component.authButton = 'Registration failed'
      component.state = "failed"
      setTimeout(() => {
        component.authButton = 'Register'
        component.state = "ready"
      }, 3000);
    }

    return
    this.http.post(
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
            this.state = "registred";
            this.authButton = 'Registred successfully !'
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

  constructor(
    private http: HttpClient,
    private Router: Router,
  ) { }

  ngOnInit(): void {
  }

}

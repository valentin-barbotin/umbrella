import { Component, OnInit, HostBinding, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { CrudService } from '../services/crud.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../user';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar'

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

export interface DialogData {
  animal: string;
  name: string;
}

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

  openDialog(): void {
    const dialogRef = this.dialog.open(resetPassword, {
      // width: '250px',
      // data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
    });
  }

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

  onSubmit(form: FormGroupDirective) {

    const formData = new FormData();
    console.log(form.control.value);

    for (const key in form.control.value) {
        formData.append(key, form.control.get(key)?.value )
    }

    if (['connected','failed'].includes(this.state)) return
    
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
      formData,
      {
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
          console.log(error);
          
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
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private Router: Router,
    public dialog: MatDialog
  ) {}
}



@Component({
  selector: 'resetPassword',
  templateUrl: './resetPassword.html',
})
export class resetPassword {

  resetForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
  });

  get login() {
    return this.resetForm.get('login');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action);
  }

  onSubmit(form: FormGroupDirective) {

    if (form.invalid) return

    const formData = new FormData();
    console.log(form.control.value);

    for (const key in form.control.value) {
        formData.append(key, form.control.get(key)?.value )
    }
    
    this.http.post(
      `${environment.api}users/resetpassword`,
      formData,
      {
        responseType: 'text',
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          console.log('resp');
          this.snackBar.open('New password is ' + response,'osef', {
            duration: 10000
          });
        },
        (error) => {
          console.log(error);
        }
      )

  }

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public dialogRef: MatDialogRef<resetPassword>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
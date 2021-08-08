import { Component, OnInit, Inject } from '@angular/core'
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { Router } from '@angular/router'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'

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
  openDialog (): void {
    const dialogRef = this.dialog.open(resetPassword, {
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed')
    })
  }

  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    otp: new FormControl('', [Validators.maxLength(6), Validators.minLength(6), Validators.pattern('^[0-9]*$')])
  });

  connecting = true;

  authButton = 'Login'
  state = 'ready';

  toggle () {
    this.connecting = !this.connecting
  }

  hide1 = true;

  get login () {
    return this.loginForm.get('login')
  }

  get password () {
    return this.loginForm.get('password')
  }

  get otp () {
    return this.loginForm.get('otp')
  }

  onSubmit (form: FormGroupDirective) {
    const formData = new FormData()

    for (const key in form.control.value) {
      formData.append(key, form.control.get(key)?.value)
    }

    if (['connected', 'failed'].includes(this.state)) return

    this.state = 'progress'
    this.authButton = 'Auth..'

    function failed (component: LoginComponent) {
      component.authButton = 'Authentication failed'
      component.state = 'failed'
      setTimeout(() => {
        component.authButton = 'Login'
        component.state = 'ready'
      }, 3000)
    }

    const login = formData.get('login')
    const password = formData.get('password')
    const otp = formData.get('otp')

    const query = gql`
    mutation login($login: String!, $password: String!, $otp: String) {
      user(login: $login, password: $password, otp: $otp) {
          username
          email
          mfa
      }
    }
    `

    this.apollo.mutate({
      mutation: query,
      variables: {
        login,
        password,
        otp
      }
    }).subscribe(
      (response: any) => {
        if (response?.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          this.state = 'connected'
          this.authButton = 'Connected !'
          setTimeout(() => {
            this.Router.navigate(['/'])
          }, 3000)
        } else {
          failed(this)
        }
      },
      (error) => {
        console.log(error)
        alert(JSON.stringify(error))
        failed(this)
      }
    )
  }

  ngOnInit (): void {
    const exist = localStorage.getItem('user')
    if (exist) {
      alert('Already connected')
      this.Router.navigate(['/'])
    }
  }

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private http: HttpClient,
    private Router: Router,
    public dialog: MatDialog,
    private apollo: Apollo
  ) {}
}

@Component({
  selector: 'resetPassword',
  templateUrl: './resetPassword.html'
})
export class resetPassword {
  resetForm = new FormGroup({
    login: new FormControl('', [Validators.required])
  });

  get login () {
    return this.resetForm.get('login')
  }

  openSnackBar (message: string, action: string) {
    this.snackBar.open(message, action)
  }

  onSubmit (form: FormGroupDirective) {
    if (form.invalid) return

    const formData = new FormData()

    for (const key in form.control.value) {
      formData.append(key, form.control.get(key)?.value)
    }

    this.http.post(
      `${environment.api}users/resetpassword`,
      formData,
      {
        responseType: 'text',
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
        this.snackBar.open('New password is ' + response, 'OK', {
          duration: 10000
        })
      },
      (error: HttpErrorResponse) => {
        alert(JSON.stringify(error))
        console.log(error)
      }
    )
  }

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public dialogRef: MatDialogRef<resetPassword>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick (): void {
    this.dialogRef.close()
  }
}

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { UserService } from '../services/user.service'
import { MatSnackBar } from '@angular/material/snack-bar'

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
    password2: new FormControl('', [Validators.required])
  });

  get username () { return this.registerForm.get('username') }
  get email () { return this.registerForm.get('email') }
  get password1 () { return this.registerForm.get('password1') }
  get password2 () { return this.registerForm.get('password2') }

  authButton = 'Register'
  state = 'ready';

  hide1 = true;
  hide2 = true;

  async register (form: FormGroupDirective) {
    if (['registred', 'failed'].includes(this.state)) return

    if (this.password1?.value !== this.password2?.value) return

    const variables: {[x: string]: any; } = {}
    for (const x of form.directives) {
      const obj = {
        [x.name ?? '']: x.value
      }
      Object.assign(variables, obj)
    }

    const created = await this.UserService.createUser(variables)

    if (created === 1) {
      this.snackBar.open('User created', 'OK', {
        duration: 5000
      })
      this.state = 'registred'
      this.authButton = 'Registred successfully !'
      setTimeout(() => {
        this.Router.navigate(['/'])
      }, 3000)
    } else {
      if (created === -2) {
        this.snackBar.open('User already exists', 'OK', {
          duration: 5000
        })
      }
      this.authButton = 'Registration failed'
      this.state = 'failed'
      setTimeout(() => {
        this.authButton = 'Register'
        this.state = 'ready'
      }, 3000)
    }
  }

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private UserService: UserService,
    private Router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit (): void {
    const exist = localStorage.getItem('user')
    if (exist) {
      alert('Already connected')
      this.Router.navigate(['/'])
    }
  }
}

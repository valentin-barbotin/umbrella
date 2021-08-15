import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, FormGroupDirective, AbstractControl } from '@angular/forms'
import { Router } from '@angular/router'
import { MatDialog, } from '@angular/material/dialog'
import { Apollo, gql } from 'apollo-angular'

import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations'
import { resetPassword } from './resetPassword'

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
            transition('* => *', [animate('0.5s')])
        ])
    ]
})
export class LoginComponent implements OnInit {

    openDialog (): void {
        this.dialog.open(resetPassword, {})
    }

    readonly OTP_LENGHT = 6
    connecting = true;
    authButton = 'Login'
    state = 'ready'

    loginForm = new FormGroup({
        login: new FormControl(
            '',
            [Validators.required]
        ),
        password: new FormControl(
            '',
            [Validators.required]
        ),
        otp: new FormControl(
            '',
            [
                Validators.maxLength(this.OTP_LENGHT),
                Validators.minLength(this.OTP_LENGHT),
                Validators.pattern('^[0-9]*$')
            ]
        )
    });

    toggle (): void {
        this.connecting = !this.connecting
    }

    hide1 = true;

    get login (): AbstractControl | null {
        return this.loginForm.get('login')
    }

    get password (): AbstractControl | null {
        return this.loginForm.get('password')
    }

    get otp (): AbstractControl | null {
        return this.loginForm.get('otp')
    }

    private failed (component: LoginComponent) {
        component.authButton = 'Authentication failed'
        component.state = 'failed'
        setTimeout(() => {
            component.authButton = 'Login'
            component.state = 'ready'
        }, 3000)
    }

    onSubmit (form: FormGroupDirective): void {

        if ([
            'connected',
            'failed'
        ].includes(this.state)) return

        this.state = 'progress'
        this.authButton = 'Auth..'

        const login = this.login?.value as string
        const password = this.password?.value as string
        const otp = this.otp?.value as string
        if (!login || !password) {
            this.failed(this)
            return
        }

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
                if (!response?.data.user) return this.failed(this)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                this.state = 'connected'
                this.authButton = 'Connected !'
                setTimeout(() => {
                    this.Router.navigate(['/'])
                }, 3000)
            },
            (error) => {
                this.failed(this)
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
        private Router: Router,
        public dialog: MatDialog,
        private apollo: Apollo
    ) { }
}

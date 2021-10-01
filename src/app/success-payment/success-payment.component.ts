import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router'


@Component({
    selector: 'app-success-payment',
    templateUrl: './success-payment.component.html',
    styleUrls: ['./success-payment.component.sass']
})
export class SuccessPaymentComponent {

    username = ''

    constructor(
        public UserService: UserService,
        public Router: Router
    ) { 
        const user = UserService.User
        if (user) {
            this.username = user.username
        }
        setTimeout(() => {
            this.Router.navigate(['/'])
        }, 3000)
    }
}

@Component({
    selector: 'app-success-payment',
    templateUrl: './failed-payment.html',
    styleUrls: ['./success-payment.component.sass']
})

export class FailedPaymentComponent {

    username = ''

    constructor(
        public UserService: UserService,
        public Router: Router
    ) { 
        const user = UserService.User
        if (user) {
            this.username = user.username
        }
        setTimeout(() => {
            this.Router.navigate(['/'])
        }, 3000)
    }
}

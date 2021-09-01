import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { UserService } from './services/user.service'
import { User } from './user'
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass']
})
export class AppComponent {


  title = 'umbrella'

  // eslint-disable-next-line no-useless-constructor
  constructor (
    public readonly router: Router,
    public UserService: UserService
  ) {
  }
}

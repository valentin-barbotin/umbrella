import { Component, Input, OnInit } from '@angular/core'
import { UserService } from '../services/user.service'
import { User } from '../user';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  @Input() val = '';

  get User (): User | null {
      return this.UserService.User
  }

  constructor (
    private UserService: UserService,
  ) {}

  ngOnInit (): void {}
}

import { Component, Input, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  @Input() val: string = "";

  get User() {
    return this.UserService.User;
  }

  constructor(
    private UserService: UserService
  ) {}

  ngOnInit(): void {
    console.log(this.User)
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

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
    private UserService: UserService,
    private Router: Router,
  ) {
    const user = localStorage.getItem('user');
    if (!user) {
      this.Router.navigate(['/'])
    }
  }

  ngOnInit(): void {
  }

}

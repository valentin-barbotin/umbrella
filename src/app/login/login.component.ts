import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CrudService } from '../services/crud.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  hide1 = true;

  get login() {
    return this.loginForm.get('login');
  }
  get password() {
    return this.loginForm.get('password');
  }

  auth() {

    const form = new FormData();
    for (const input in this.loginForm.controls) {
      form.append(input, this.loginForm.get(input)?.value);
    }

    this.CrudService.POST('users/login', form).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
    console.log('test')
  }

  ngOnInit(): void {}

  constructor(private CrudService: CrudService) {}
}

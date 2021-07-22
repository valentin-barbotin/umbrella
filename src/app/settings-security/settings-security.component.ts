import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { gql } from 'apollo-angular';



@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.sass']
})


export class SettingsSecurityComponent implements OnInit {

  changePwdForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(2)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  changeEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    newEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  changePwd = "Changer le mot de passe"
  changeEmail = "Changer l'adresse mail"
  state = "ready";

  get password1() {
    return this.changePwdForm.get('password1')
  }
  get password2() {
    return this.changePwdForm.get('password2')
  }

  get email1() {
    return this.changePwdForm.get('email1')
  }

  get email2() {
    return this.changePwdForm.get('email2')
  }

  changePassword(form: FormGroupDirective) {
    const password1 = this.password1?.value
    const password2 = this.password2?.value

    if (!password1 || !password2) return
    if (password1 !== password2) return

    const query = gql`
    mutation login($login: String!, $password: String!) {
      user(login: $login, password: $password) {
          username
          email
      }
    }
    `

  }

  constructor() { }

  ngOnInit(): void {
  }

}

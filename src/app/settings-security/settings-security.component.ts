import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'
import { User } from '../user'

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.sass']
})

export class SettingsSecurityComponent implements OnInit {
  changePwdForm = new FormGroup({
    password1: new FormControl('', [Validators.required, Validators.minLength(2)]),
    password2: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  changeEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    newEmail: new FormControl('', [Validators.required, Validators.email])
  });

  changePwd = 'Changer le mot de passe'
  changeEmail = "Changer l'adresse mail"
  state = 'ready';

  get password1() {
    return this.changePwdForm.get('password1')
  }

  get password2() {
    return this.changePwdForm.get('password2')
  }

  get email1() {
    return this.changeEmailForm.get('email1')
  }

  get email2() {
    return this.changeEmailForm.get('email2')
  }

  changePassword(form: FormGroupDirective) {
    const password1 = this.password1?.value
    const password2 = this.password2?.value
    const userStorage = localStorage.getItem('user')

    if (!userStorage) return

    const user = JSON.parse(userStorage) as User
    if (!user) return

    if (!password1 || !password2) {
      this.snackBar.open("Un champ n'est pas rempli", 'OK', {
        duration: 5000
      })
      return
    }

    if (password1 !== password2) {
      this.snackBar.open('Les valeurs des deux champs sont différents', 'OK', {
        duration: 5000
      })
      return
    }

    const query = gql`
    mutation editPassword($password: String!, $username: String!) {
      edit(password: $password, username: $username) 
    }`

    this.apollo.mutate({
      mutation: query,
      variables: {
        password: password1,
        username: user.username
      }
    }).subscribe(
      (response: any) => {
        let msg = ''
        switch (response.data.edit) {
          case true:
            msg = 'Mot de passe changé'
            break;
          case false:
            msg = "Il s'agit du mot de passe actuel"
            break;

          default:
            break;
        }

        this.snackBar.open(msg, 'OK', {
          duration: 5000
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  constructor(
    private apollo: Apollo,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }
}

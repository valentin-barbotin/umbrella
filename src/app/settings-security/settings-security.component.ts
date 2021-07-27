import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
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
    email1: new FormControl('', [Validators.required, Validators.email]),
    email2: new FormControl('', [Validators.required, Validators.email])
  });

  changePwd = 'Changer le mot de passe'
  changeMail = "Changer l'adresse mail"
  state = 'ready'
  dualAuth = true

  get password1 () {
    return this.changePwdForm.get('password1')
  }

  get password2 () {
    return this.changePwdForm.get('password2')
  }

  get email1 () {
    return this.changeEmailForm.get('email1')
  }

  get email2 () {
    return this.changeEmailForm.get('email2')
  }

  changePassword () {
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
      edit: editPassword(password: $password, username: $username) 
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
            break
          case false:
            msg = "Il s'agit du mot de passe actuel"
            break

          default:
            break
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

  changeEmail () {
    const email1 = this.email1?.value
    const email2 = this.email2?.value
    const userStorage = localStorage.getItem('user')

    if (!userStorage) return

    const user = JSON.parse(userStorage) as User
    if (!user) return

    if (!email1 || !email2) {
      this.snackBar.open("Un champ n'est pas rempli", 'OK', {
        duration: 5000
      })
      return
    }

    if (email1 !== email2) {
      this.snackBar.open('Les valeurs des deux champs sont différents', 'OK', {
        duration: 5000
      })
      return
    }

    if (user.email === email1) {
      this.snackBar.open("Il s'agit de l'email actuel", 'OK', {
        duration: 5000
      })
    }

    const query = gql`
    mutation editEmail($email: String!, $username: String!) {
      edit: editEmail(email: $email, username: $username) 
    }`
    console.log(user.username)

    this.apollo.mutate({
      mutation: query,
      variables: {
        email: email1,
        username: user.username
      }
    }).subscribe(
      (response: any) => {
        let msg = "Il s'agit de l'email actuel"
        console.log(response)

        if (response.data.edit) {
          msg = 'Email changé'
          user.email = email1
          localStorage.setItem('user', JSON.stringify(user))
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

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private apollo: Apollo,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit (): void {
  }
}

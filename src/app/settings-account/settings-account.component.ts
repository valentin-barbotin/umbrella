import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'
import { User } from '../user'
@Component({
  selector: 'app-settings-account',
  templateUrl: './settings-account.component.html',
  styleUrls: ['./settings-account.component.sass']
})
export class SettingsAccountComponent implements OnInit {
  changeInfoForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());


  change = 'Modifier les informations'

  get username () {
    return this.changeInfoForm.get('username')
  }

  changeUsername () {
    const username = this.username?.value
    const userStorage = localStorage.getItem('user')

    if (!userStorage) return

    const user = JSON.parse(userStorage) as User
    if (!user) return

    const query = gql`
    mutation editEmail($email: String!, $username: String!) {
      edit: editEmail(email: $email, username: $username) 
    }`
    console.log(user.username)

    this.apollo.mutate({
      mutation: query,
      variables: {
        newUsername: username,
        username: user.username
      }
    }).subscribe(
      (response: any) => {
        let msg = "Il s'agit de l'email actuel"
        console.log(response)

        if (response.data.edit) {
          msg = 'Email changé'
          user.username = username
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
  constructor () { }

  ngOnInit (): void {
  }
}

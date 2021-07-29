import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'
import { User } from '../user'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'app-settings-account',
  templateUrl: './settings-account.component.html',
  styleUrls: ['./settings-account.component.sass']
})
export class SettingsAccountComponent implements OnInit {
  openDialog (): void {
    const dialogRef = this.dialog.open(delAccount, { panelClass: 'custom-dialog-container' })

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed')
    })
  }

  changeInfoForm = new FormGroup({
    newUsername: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());

  change = 'Modifier les informations'

  get username () {
    return this.changeInfoForm.get('newUsername')
  }

  changeUsername () {
    const username = this.username?.value
    const userStorage = localStorage.getItem('user')

    if (!userStorage) return

    const user = JSON.parse(userStorage) as User
    if (!user) return

    const query = gql`
    mutation editUsername($newUsername: String!, $username: String!) {
      edit: editUsername(newUsername: $newUsername, username: $username) 
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
        let msg = "Il s'agit du nom d'utilisateur actuel"

        if (response.data.edit) {
          msg = "Nom d'utilisateur modifié"
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
  constructor (
    private apollo: Apollo,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit (): void {
  }
}

@Component({
  selector: 'confirm-delaccount.html',
  templateUrl: './confirm-delaccount.html',
  styleUrls: ['./settings-account.component.sass']
})
export class delAccount {
  delAccountForm = new FormGroup({
    myUsername: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  delAccount = 'Supprimer votre compte'

  get username () {
    return this.delAccountForm.get('myUsername')
  }

  removeAccount () {
    const username = this.username?.value
    const userStorage = localStorage.getItem('user')

    if (!userStorage) return

    const user = JSON.parse(userStorage) as User
    if (!user) return

    const query = gql`
    mutation removeAccount($myUsername: String!, $username: String!) {
      edit: removeAccount(myUsername: $myUsername, username: $username) 
    }`
    console.log(user.username)

    this.apollo.mutate({
      mutation: query,
      variables: {
        myUsername: username,
        username: user.username
      }
    }).subscribe(
      (response: any) => {
        let msg = "Echec lors de la supprésion du compte, le nom d'utilisateur ne correspond pas"

        if (response.data.edit) {
          msg = 'Le compte a bien été supprimé'
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
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<delAccount>
  ) {}

  onNoClick (): void {
    this.dialogRef.close()
  }
}

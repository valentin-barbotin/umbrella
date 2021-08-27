import { Component, Inject, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'
import { User } from '../user'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { UserService } from '../services/user.service'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
    selector: 'app-settings-security',
    templateUrl: './settings-security.component.html',
    styleUrls: ['./settings-security.component.sass']
})

export class SettingsSecurityComponent implements OnInit {
    getMFA (event: MatSlideToggleChange): void {
        if (event.checked) {
            this.setupOTP()
        } else {
            this.UserService.removeOTP()
        }
    }

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

  MFAActivated = false

  get password1 (): AbstractControl | null {
      return this.changePwdForm.get('password1')
  }

  get password2 (): AbstractControl | null {
      return this.changePwdForm.get('password2')
  }

  get email1 (): AbstractControl | null {
      return this.changeEmailForm.get('email1')
  }

  get email2 (): AbstractControl | null {
      return this.changeEmailForm.get('email2')
  }

  changePassword (): void {
      const password1 = this.password1?.value
      const password2 = this.password2?.value

      const user = this.UserService.User
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
              const msg = response.data.edit
                  ? 'Mot de passe changé'
                  : 'Il s\'agit du mot de passe actuel'

              this.snackBar.open(msg, 'OK', {
                  duration: 5000
              })
          },
          (error) => {
              console.log(error)
          }
      )
  }

  changeEmail (): void {
      const email1 = this.email1?.value
      const email2 = this.email2?.value

      const user = this.UserService.User
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

  async setupOTP () {
      const token = await this.UserService.generateOTP()
      const diag = this.dialog.open(dualAuth, { panelClass: 'custom-dialog-container', data: { token } })
      this.snackBar.open('Scan this QR Code with your authentificator app on your smartphone, and enter it to complete the activation', 'OK', {
          duration: 5000
      })

      diag.afterClosed().subscribe(result => {
          console.log(result)
          this.MFAActivated = result
          console.log('The dialog was closed')
      })
  }

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private apollo: Apollo,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private UserService: UserService
  ) {
      this.MFAActivated = this.UserService.User?.mfa ?? false
  }

  ngOnInit (): void {
  }
}

@Component({
    selector: 'dualAuth',
    templateUrl: './dualAuth.html',
    styleUrls: ['./settings-security.component.sass']
})
export class dualAuth {
  otp = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.minLength(6)])
  })

  get code (): AbstractControl | null {
      return this.otp.get('code')
  }

  activated = false

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<dualAuth>,
    public dialog: MatDialog,
    private UserService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.dialogRef.backdropClick().subscribe(() => {
          console.log('background')
          this.dialogRef.close(this.activated)
      })
  }

  async onSubmit (): Promise<void> {
      if (this.otp.invalid) return
      if (!this.code) return
      const code: string = this.code.value
      if (!code) return
      const valid = await this.UserService.checkOTP(code)
      let msg = 'Code validated'
      if (valid) {
          this.UserService.validateOTP()
          this.dialogRef.close(true)
      } else {
          msg = 'Code invalid'
          this.code.setValue('')
      }
      this.snackBar.open(msg, 'OK', {
          duration: 5000
      })
  }

  onNoClick (): void {
      console.log('no click')
  }
}

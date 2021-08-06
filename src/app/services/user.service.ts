import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'
import { User } from '../user'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
    private snackBar: MatSnackBar,
    private apollo: Apollo
  ) { }

  public get User () {
    const user = localStorage.getItem('user')
    if (user) {
      return JSON.parse(user) as User
    }
    return null
  }

  checkOTP (code: string) {
    const user = this.User
    if (!user) return

    const query = gql`
    mutation checkOTP($username: String!, $code: String!) {
      checkOTP(username: $username, code: $code)
    }`

    return new Promise<boolean>((resolve, reject) => {
      this.apollo.mutate({
        mutation: query,
        variables: {
          username: user.username,
          code
        }
      }).subscribe(
        (response: any) => {
          resolve(response.data.checkOTP)
          this.snackBar.open('Validated', 'OK', {
            duration: 5000
          })
        },
        (error) => {
          reject(error)
          console.log(error)
        }
      )
    })
  }

  removeOTP () {
    const user = this.User
    if (!user) return
    const query = gql`
    mutation removeOTP($username: String!) {
      removeOTP(username: $username)
    }`
    this.apollo.mutate({
      mutation: query,
      variables: {
        username: user.username
      }
    }).subscribe(
      (response: any) => {
        this.snackBar.open('2FA removed', 'OK', {
          duration: 5000
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  generateOTP () {
    const user = this.User
    if (!user) return

    const query = gql`
    mutation generateOTP($username: String!) {
      generateOTP: generateOTP(username: $username)
    }`

    return new Promise<string>((resolve, reject) => {
      this.apollo.mutate({
        mutation: query,
        variables: {
          username: user.username
        }
      }).subscribe(
        (response: any) => {
          const token = response.data.generateOTP
          resolve(token)
          console.log(token)
        },
        (error) => {
          reject(error)
          console.log(error)
        }
      )
    })
  }

  validateOTP () {
    const user = this.User
    if (!user) return
    const query = gql`
    mutation validateOTP($username: String!) {
      validateOTP(username: $username)
    }`
    this.apollo.mutate({
      mutation: query,
      variables: {
        username: user.username
      }
    }).subscribe(
      (response: any) => {
      },
      (error) => {
        console.log(error)
      }
    )
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { Injectable } from '@angular/core';
import { element } from 'protractor';
import { ISubscription } from '../interfaces/subscription'
import { Apollo, gql } from 'apollo-angular';
import { User } from '../user'
import { Subscription } from 'rxjs';


interface Monthly {
  id: string;
  name: string;
  children?: Monthly[]
}

interface Annual {
  id: string;
  name: string;
  children?: Annual[]
}

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.sass']
})

export class SubscriptionComponent implements OnInit {

  subscriptions: ISubscription[] = []

  openDialog (subscription: ISubscription): void {
      this.dialog.open(payment, { data: subscription})
  }

  // eslint-disable-next-line no-useless-constructor
  constructor(
    public dialog: MatDialog,
    private apollo: Apollo
  ) {}

  getSubscriptions (id?: string): void {

      const variables = {
          id
      }

      this.apollo.watchQuery({
          query: gql`
          query subscriptions($id: String) {
            subscriptions(id: $id) {
                id
                name
                price
                storage
              }
            }
            `,

          variables
      }).
          valueChanges.
          subscribe((result: any) => {
              const {subscriptions} = result.data
              this.subscriptions = subscriptions
          })
  }

  ngOnInit (): void {
      this.getSubscriptions()
  }

}

@Component({
    selector: 'payment',
    templateUrl: './payment.html',
    styleUrls: ['./subscription.component.sass']
})

export class payment {

  activated = false
  subscriptions = ''

  newSub = this.subscription.name

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  changeSubscription () {
      const userStorage = localStorage.getItem('user')

      if (!userStorage) return

      const user = JSON.parse(userStorage) as User
      if (!user) return

      const query = gql`
        mutation editSubscription($newSub: String!, $username: String!) {
          edit: editSubscription(newSub: $newSub, username: $username) 
        }`

      this.apollo.mutate({
          mutation: query,
          variables: {
              newSub: this.newSub,
              username: user.username
          }
      }).subscribe(
          (response: any) => {
              let msg = "Echec"
              console.log(response);

              if (response.data.edit) {
                  msg = "Subscription modifiée"
                  user.sub = this.newSub
                  localStorage.setItem('user', JSON.stringify(user))
              }

              this.snackBar.open(msg, 'OK', {
                  duration: 5000
              })
          },
          (error: any) => {
              console.log(error)
          }
      )
      console.log(user.sub);

  }



  // eslint-disable-next-line no-useless-constructor
  constructor (
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<payment>,
    public dialog: MatDialog,
    private apollo: Apollo,
    @Inject(MAT_DIALOG_DATA) public subscription: any
  ) {
      this.dialogRef.backdropClick().subscribe(() => {
          console.log('background')
          this.dialogRef.close(this.activated)
      })
  }


  onNoClick (): void {
      console.log('no click')
  }
}

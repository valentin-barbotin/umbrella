import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { Injectable } from '@angular/core';
import { element } from 'protractor';
import { ISubscription } from '../interfaces/subscription'
import { Apollo, gql } from 'apollo-angular';


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
  subscriptions: any;
  apollo: any;



  // eslint-disable-next-line no-useless-constructor
  constructor (
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<payment>,
    public dialog: MatDialog,
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

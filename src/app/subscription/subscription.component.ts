import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'





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

  openDialog (): void {
    this.dialog.open(payment, {})
}
  
 

  // TREE_DATA: Monthly[] = [
  //     {
  //         name: 'Pro1',
  //         id: 'Pro1'
  //     },
  //     {
  //         name: 'Pro2',
  //         id: 'Pro2'
  //     },
  //     {
  //         name: 'Pro3',
  //         id: 'Pro3'
  //     },
  //     {
  //         name: 'Pro4',
  //         id: 'Pro4'
  //     },

  // ]

  constructor(
    public dialog: MatDialog
  ) {
    
   }

  ngOnInit(): void {
  }

}

@Component({
  selector: 'payment',
  templateUrl: './payment.html',
  styleUrls: ['./subscription.component.sass']
})

export class payment {
  

  activated: boolean = false


  // eslint-disable-next-line no-useless-constructor
  constructor (
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<payment>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
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

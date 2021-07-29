import { Component, Inject } from '@angular/core'
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { gql } from 'apollo-angular'

@Component({
  selector: 'createFolder',
  templateUrl: './createFolder.component.html'
})
export class createFolderComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<createFolderComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  createFolder = new FormGroup({
    folder: new FormControl('', [Validators.required])
  });

  get folder () {
    return this.createFolder.get('folder')
  }

  onSubmit (form: FormGroupDirective) {
    const formData = new FormData()

    for (const key in form.control.value) {
      formData.append(key, form.control.get(key)?.value)
    }

    const folder = formData.get('folder')

    const query = gql`
    
    `
  }

  onNoClick (): void {
    this.dialogRef.close()
  }
}

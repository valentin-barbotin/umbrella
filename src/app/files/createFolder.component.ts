import { Component, Inject } from '@angular/core'
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'

@Component({
  selector: 'createFolder',
  templateUrl: './createFolder.component.html'
})
export class createFolderComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        private snackBar: MatSnackBar,
        private apollo: Apollo,
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
    const name = form.control.get('folder')?.value
    if (!name) return

    const parent = this.data.folder

    const query = gql`
      mutation createFolder($parent: String, $name: String!) {
        createFolder(parent: $parent, name: $name)
      }
    `

    this.apollo.mutate({
      mutation: query,
      variables: {
        parent,
        name
      }
    }).subscribe(
      (result: any) => {
        if (result.data.createFolder) {
          this.snackBar.open('Dossier crée', 'OK')
          this.dialogRef.close(result)
        }
      },
      (error) => {
        this.snackBar.open('Erreur de création', 'OK')
        console.log(error)
      }
    )
  }

  onNoClick (): void {
    this.dialogRef.close()
  }

}

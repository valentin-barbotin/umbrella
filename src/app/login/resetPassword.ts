import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component, Inject } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "src/environments/environment";

@Component({
    selector: 'resetPassword',
    templateUrl: './resetPassword.html'
})
export class resetPassword {
    resetForm = new FormGroup({
        login: new FormControl('', [Validators.required])
    });

    get login (): AbstractControl | null {
        return this.resetForm.get('login')
    }

    openSnackBar (message: string, action: string): void {
        this.snackBar.open(message, action)
    }

    onSubmit (form: FormGroupDirective): void {
        if (form.invalid) return
        const { login } = this
        if (!login) return
        const formData = new FormData()

        formData.append('login', login.value)

        this.http.post(
            `${environment.api}users/resetpassword`,
            formData,
            {
                responseType: 'text',
                reportProgress: true,
                withCredentials: true
            }
        ).subscribe(
            (response) => {
                const msg = response === 'User not found'
                    ? response
                    : `New password is ${response}`

                this.snackBar.open(msg, 'OK', {
                    duration: 10000
                })
            },
            (error: HttpErrorResponse) => {
                console.log(error)
            }
        )
    }

    // eslint-disable-next-line no-useless-constructor
    constructor (
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private dialogRef: MatDialogRef<resetPassword>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    onNoClick (): void {
        this.dialogRef.close()
    }
}

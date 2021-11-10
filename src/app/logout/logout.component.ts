import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { environment } from '../../environments/environment'
import { MatSnackBar } from '@angular/material/snack-bar'


@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.sass']
})
export class LogoutComponent implements OnInit {
    // eslint-disable-next-line no-useless-constructor
    constructor (
    private Router: Router,
    private http: HttpClient,
    private cookieService: CookieService,
    private snackBar: MatSnackBar,

    ) { }

    ngOnInit (): void {
        const exist = localStorage.getItem('user')
        if (!exist) {
            this.Router.navigate(['/'])
            return
        }

        this.http.get(
            `${environment.api}users/logout`,
            {
                // Headers: new HttpHeaders(this.CrudService.getHeaders()),
                reportProgress: true,
                withCredentials: true
            }
        ).subscribe(
            (response) => {
                console.log(response)
                if (response) {
                    this.Router.navigate(['/'])
                }
            },
            (error) => {
                console.log(error)
            }
        )
        localStorage.removeItem('user')
        this.snackBar.open("You're disconnected", 'OK', {
            duration: 5000
          })
          setTimeout(() => {
            this.Router.navigate(['/'])
        })
    }
}

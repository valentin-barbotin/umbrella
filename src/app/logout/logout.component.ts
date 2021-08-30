import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { environment } from '../../environments/environment'

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
    private cookieService: CookieService
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
                localStorage.removeItem('user')
                this.cookieService.delete('connect.sid')
                if (response) {
                    this.Router.navigate(['/'])
                }
            },
            (error) => {
                console.log(error)
            }
        )
    }
}

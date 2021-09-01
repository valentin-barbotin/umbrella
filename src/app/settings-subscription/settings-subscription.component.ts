import { JsonpClientBackend } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { FileService } from '../services/file.service'
import { UserService } from '../services/user.service'
@Component({
    selector: 'app-settings-subscription',
    templateUrl: './settings-subscription.component.html',
    styleUrls: ['./settings-subscription.component.sass']
})
export class SettingsSubscriptionComponent implements OnInit {

    userSub = ''

    checkSub() {
        const user = localStorage.getItem('user')
        if (!user) return
        const sub = JSON.parse(user)
        this.userSub = sub.sub
    }

    // eslint-disable-next-line no-useless-constructor
    constructor (public FileService: FileService) { }

    ngOnInit (): void {
        this.checkSub()
    }
}

import { Component } from '@angular/core'
import { FileService } from '../services/file.service'
import { UserService } from '../services/user.service'
@Component({
    selector: 'app-settings-subscription',
    templateUrl: './settings-subscription.component.html',
    styleUrls: ['./settings-subscription.component.sass']
})
export class SettingsSubscriptionComponent {

    userSub = ''

    // eslint-disable-next-line no-useless-constructor
    constructor (
        public FileService: FileService,
        private UserService: UserService
    ) {
        const user = UserService.User
        if (user) {
            this.userSub = user.sub
        }
    }
}

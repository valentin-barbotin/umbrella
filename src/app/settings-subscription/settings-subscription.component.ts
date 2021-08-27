import { Component, OnInit } from '@angular/core'
import { FileService } from '../services/file.service'
@Component({
    selector: 'app-settings-subscription',
    templateUrl: './settings-subscription.component.html',
    styleUrls: ['./settings-subscription.component.sass']
})
export class SettingsSubscriptionComponent implements OnInit {
    // eslint-disable-next-line no-useless-constructor
    constructor (public FileService: FileService) { }

    ngOnInit (): void {
    }
}

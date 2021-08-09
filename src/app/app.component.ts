import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'umbrella'

  // eslint-disable-next-line no-useless-constructor
  constructor (
    public readonly router: Router
  ) {
  }
}

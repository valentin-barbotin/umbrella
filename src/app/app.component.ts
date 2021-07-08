import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'umbrella';

  valeur = 20;

  changeVal(value: string) {
    console.log(value)

  }

  constructor() {
    console.log(123)

    
  }

}

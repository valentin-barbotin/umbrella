import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'umbrella';
  test = "soeur";

  valeur = 20;

  soeur = false;

  changeVal(value: string) {
    console.log(value)
    this.test = value;

  }

  constructor() {
    console.log(123)
    this.test = "soeur2";
  }

}

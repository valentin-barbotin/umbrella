import { Component, Input } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CrudService } from './services/crud.service';


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

  constructor(
    private http: HttpClient,
    private CrudService: CrudService,
  ) {}

}

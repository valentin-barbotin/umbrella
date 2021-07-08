import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { File } from '../file';
@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.sass']
})
export class FilesComponent implements OnInit {

  files: File[] = []

  getFiles() {
    this.http.get<File[]>(
      `${environment.api}files/list`,
      {
        headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          this.files = response
        },
        (error) => {
          console.log('Cannot retrieve files')
        }
      )
  }

  constructor(
    private CrudService: CrudService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.getFiles()
  }

}

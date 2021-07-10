import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { File, IData } from '../file';
@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.sass']
})
export class FilesComponent implements OnInit {

  files: IData[] = []

  hoveredElement?: string;

  pickedElements?: Set<any>

  isItPicked(id: string) {
    return this.pickedElements?.has(id)
  }

  pickFile(event: MouseEvent) {
    let elem: HTMLElement | null = event.target as HTMLElement

    if (elem.nodeName == 'TD') {
      elem = elem.parentElement 
    }
    if (!elem) return

    const id = elem.id
    const ctrlKey = event.ctrlKey
    
    if (!this.pickedElements) {
      this.pickedElements = new Set()
    } else {

      if (!ctrlKey) {
        this.pickedElements.clear()
      }

    }

    if (this.pickedElements.has(id)) {
      this.pickedElements.delete(id)
    } else {
      this.pickedElements.add(id)
    }

  }

  getFiles() {
    this.http.get<IData[]>(
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

  uploadFile(elem: HTMLInputElement) {
    const files = elem.files;
    if (!files) return

    let form = new FormData();

    let amount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) return
      if (this.checkFile(file)) {
        form.append('file' + i, file)
        ++amount
      }
    }

    if (amount == 0) return

    this.http.post(
      `${environment.api}files/upload/true/true`,
      form,
      {
        headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
    ).subscribe(
      (response) => {
        console.log(response)
        this.getFiles()
      },
      (error) => {
        console.log(error)
      }
    )

  }

  checkFile(file: globalThis.File) {
    const allowed = [
      'image/png'
    ];
    
    let size = false;
    let type = false;
    if (allowed.includes(file.type)) {
      type = true
    }

    if (file.size < 5000000) {
      size = true
    }

    // return size && type
    return true
  }

  constructor(
    private CrudService: CrudService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.getFiles()
  }

}

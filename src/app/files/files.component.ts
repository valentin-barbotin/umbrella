import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../services/crud.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { File, IData } from '../file';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.sass']
})
export class FilesComponent implements OnInit {

  files: IData[] = []

  hoveredElement?: string;

  pickedElements?: Set<any>
  pickedElementsTotalSize : number = 0

  isItPicked(id: string) {
    return this.pickedElements?.has(id)
  }

  shareFile() {
    navigator.clipboard.writeText("test")
  }

  deleteFiles() {
    if (!this.pickedElements) return
    const res = confirm(`Do you really want to delete ${this.pickedElements.size} files. This action is irreversible`)

    if (!res) return

    this.cookieService.set('fileselection',JSON.stringify([...this.pickedElements]))

    this.http.delete(
      `${environment.api}files/delete`,
      {
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          this.getFiles()
        },
        (error: HttpErrorResponse) => {
        }
      )
  }

  responseToBlob(response: Blob, file: string) {
    let dataType = response.type;
    let binaryData = [];
    binaryData.push(response);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
    if (file)
        downloadLink.setAttribute('download', file);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  download(file?: string) {

    if (file) {
      this.http.get(
        `${environment.api}files/download/${file}`,
        {
          responseType: 'blob',
          reportProgress: true,
          withCredentials: true,
        }
        ).subscribe(
          (response) => {
            this.responseToBlob(response, file)
          },
          (error: HttpErrorResponse) => {}
        )
      return
    }

    if (!this.pickedElements) return
    
    if (this.pickedElements.size == 1) {
      const file = this.pickedElements.values().next().value;
      this.http.get(
        `${environment.api}files/download/${file}`,
        {
          responseType: 'blob',
          reportProgress: true,
          withCredentials: true,
        }
        ).subscribe(
          (response) => {
            this.responseToBlob(response, file)
          },
          (error: HttpErrorResponse) => {}
        )
      return
    }
    
    this.cookieService.set('fileselection',JSON.stringify([...this.pickedElements]))

    this.http.get(
      `${environment.api}files/download`,
      {
        responseType: 'blob',
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          
          this.responseToBlob(response, 'randomName')
        },
        (error: HttpErrorResponse) => {}
      )


  }

  async downloadSelection() {
    if (!this.pickedElements) return
    this.download()
  }

  pickFile(event: MouseEvent) {
    let elem: HTMLElement | null = event.target as HTMLElement

    if (elem.nodeName == 'TD') {
      elem = elem.parentElement 
    }
    if (!elem) return

    const id = elem.id
    const size = parseInt( elem.attributes.getNamedItem('filesize')?.value || "0" )
    const ctrlKey = event.ctrlKey
    
    if (!this.pickedElements) {
      this.pickedElements = new Set()
      this.pickedElementsTotalSize = 0
    } else {

      if (!ctrlKey) {
        this.pickedElementsTotalSize = 0
        this.pickedElements.clear()
      }

    }

    if (this.pickedElements.has(id)) {
      this.pickedElementsTotalSize -= size
      this.pickedElements.delete(id)
    } else {
      this.pickedElementsTotalSize += size
      this.pickedElements.add(id)
    }

  }
  

  getFiles() {
    
    this.http.get<IData[]>(
      `${environment.api}files/list`,
      {
        // headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
      ).subscribe(
        (response) => {
          this.files = response
        },
        (error: HttpErrorResponse) => {
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
        // headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true,
      }
    ).subscribe(
      (response) => {
        this.getFiles()
      },
      (error) => {
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
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  ngOnInit(): void {
    this.getFiles()
  }

}

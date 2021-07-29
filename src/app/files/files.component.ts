import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
// import { Router } from '@angular/router'
// import { CrudService } from '../services/crud.service'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { IData } from '../file'
import { CookieService } from 'ngx-cookie-service'
import { Apollo, gql, QueryRef } from 'apollo-angular'
import { ProgressBarMode } from '@angular/material/progress-bar'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { nanoid } from 'nanoid'
import { MatDialog } from '@angular/material/dialog'
import { createFolderComponent } from './createFolder.component'

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.sass']
})
export class FilesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  // dataSource!: MatTableDataSource<IData>;
  dataSource = new MatTableDataSource([]);
  files: IData[] = []
  sizeLimit: number = 1e10;
  sizeTotal: number = 0;
  loading: boolean = false;

  hoveredElement?: string;

  pickedElements: Set<string> = new Set()
  pickedElementsTotalSize : number = 0

  stateUploading: ProgressBarMode = 'indeterminate'
  stateFixed: ProgressBarMode = 'determinate'
  stateProgress = 'determinate';

  displayedColumns = ['name', 'size', 'type', 'createdOn']

  filesQuery?: QueryRef<any>
  querySubscription?: Subscription;

  ngAfterViewInit () {
    if (!this.dataSource) return
    this.dataSource.sort = this.sort
  }

  getProgressState () {
    return this.stateProgress ? this.stateUploading : this.stateFixed
  }

  calcUsedStorage () {
    return (this.sizeTotal / this.sizeLimit) * 100
  }

  isItPicked (id: string) {
    return this.pickedElements?.has(id)
  }

  /**
   * Return all pubId of the files
   */
  getIDs (set: Set<string>) {
    const items = []
    for (const element of [...set]) {
      items.push(
        this.files.find(x => x.name === element)?.pubId
      )
    }
    return items
  }

  /**
   * Return the pubId of the file
   */
  getID (set: Set<string>) {
    const selection = set.values().next().value
    return this.files.find(x => x.name === selection)?.pubId
  }

  shareFile () {
    const selectionSize = this.pickedElements.size
    switch (true) {
      case (selectionSize === 0):
        this.snackBar.open('No selection', 'OK')
        return
      case (selectionSize > 1):
        this.snackBar.open('Only one file at time can be shared', 'OK')
        return
    }

    const pubId = this.getID(this.pickedElements)
    if (!pubId) return console.log('No pubId found')

    this.apollo.watchQuery({
      query: gql`
      query filesharing($file: String!) {
        filesharing(file: $file)
      }
      `,

      variables: {
        file: pubId
      }
    })
      .valueChanges
      .subscribe(
        (result: any) => {
          const key = result.data.filesharing
          const fullLink = `${environment.api}files/download/${pubId}?key=${key}`
          navigator.clipboard.writeText(fullLink)
          this.snackBar.open(fullLink, 'OK')
        }
      )
  }

  createFolder () {
    const dialogRef = this.dialog.open(createFolderComponent, {
    })

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed')
    // })
  }

  applyFilter (event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  deleteFiles () {
    if (!this.pickedElements) return
    const amount = this.pickedElements.size
    const res = confirm(`Do you really want to delete ${amount} files. This action is irreversible`)

    if (!res) return

    const elements = this.getIDs(this.pickedElements)

    this.cookieService.set('fileselection', JSON.stringify(elements))

    this.http.delete(
      `${environment.api}files/delete`,
      {
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
        this.snackBar.open(`${amount} files have been deleted`, 'Ok', {
          duration: 10000
        })

        this.getFiles()
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  responseToBlob (response: Blob, file: string) {
    const dataType = response.type
    const binaryData = []
    binaryData.push(response)
    const downloadLink = document.createElement('a')
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }))
    if (file) { downloadLink.setAttribute('download', file) }
    document.body.appendChild(downloadLink)
    downloadLink.click()
  }

  download (file?: string) {
    if (file) {
      this.http.get(
        `${environment.api}files/download/${file}`,
        {
          responseType: 'blob',
          reportProgress: true,
          withCredentials: true
        }
      ).subscribe(
        (response) => {
          this.responseToBlob(response, file)
        },
        (error: HttpErrorResponse) => {
          console.log(error)
        }
      )
      return
    }

    if (!this.pickedElements) return

    if (this.pickedElements.size === 1) {
      const pubId = this.getID(this.pickedElements)
      if (!pubId) return console.log('No pubId found')

      this.http.get(
        `${environment.api}files/download/${pubId}`,
        {
          responseType: 'blob',
          reportProgress: true,
          withCredentials: true
        }
      ).subscribe(
        (response) => {
          const filename = this.pickedElements.values().next().value
          this.responseToBlob(response, filename)
        },
        (error: HttpErrorResponse) => {
          console.log(error)
        }
      )
      return
    }

    const elements = this.getIDs(this.pickedElements)

    this.cookieService.set('fileselection', JSON.stringify(elements))

    this.http.get(
      `${environment.api}files/download`,
      {
        responseType: 'blob',
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
        this.responseToBlob(response, nanoid())
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  async downloadSelection () {
    if (!this.pickedElements) return
    this.download()
  }

  pickFile (event: MouseEvent, file: IData) {
    const id = file.name
    const size = file.size
    const ctrlKey = event.ctrlKey
    const metaKey = event.metaKey

    if (!ctrlKey && !metaKey) {
      this.pickedElementsTotalSize = 0
      this.pickedElements.clear()
    }

    if (this.pickedElements.has(id)) {
      this.pickedElementsTotalSize -= size
      this.pickedElements.delete(id)
      return
    }

    this.pickedElementsTotalSize += size
    this.pickedElements.add(id)
  }

  getFiles () {
    if (!this.filesQuery) return
    this.pickedElements?.clear()
    this.pickedElementsTotalSize = 0
    this.stateProgress = 'query'
    this.filesQuery.refetch().then(
      () => {
        this.stateProgress = 'determinate'
      }
    )
  }

  uploadFile (elem: HTMLInputElement) {
    const files = elem.files

    if (!files) return

    let totalSize = 0
    const form = new FormData()

    let amount = 0
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)
      if (!file) return
      if (this.checkFile(file)) {
        const fileExists = this.files.filter(x =>
          x.name === file.name
        )

        let replace = true
        if (fileExists.length > 0) {
          if (!confirm(`${file.name} is already in this folder, do you want to replace it ?`)) {
            replace = false
          }
        }

        if (replace) {
          totalSize += file.size
          form.append('file' + i, file)
          ++amount
        }
      } else {
        this.snackBar.open('Invalid file', 'OK')
        return
      }
    }

    elem.value = ''
    if (amount === 0) return

    this.stateProgress = 'indeterminate'

    if (this.sizeTotal + totalSize > this.sizeLimit) {
      this.snackBar.open('No enough space available', 'OK', {
        duration: 10000
      })
      return
    }

    this.http.post(
      `${environment.api}files/upload/true/true`,
      form,
      {
        // headers: new HttpHeaders(this.CrudService.getHeaders()),
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
        this.snackBar.open(`${amount} files have been uploaded`, 'Ok', {
          duration: 10000
        })

        this.getFiles()
      },
      (error) => {
        console.log(error)
      }
    )
  }

  checkFile (file: globalThis.File) {
    if (!environment.checkUploadedFiles) return true

    const allowed = [
      'image/png'
    ]

    if (!allowed.includes(file.type)) {
      this.snackBar.open('This type of file is not allowed', 'OK')
      return false
    }

    if (file.size > 5000000) {
      this.snackBar.open('The file is too large to be stored', 'OK')
      return false
    }

    return true
  }

  // eslint-disable-next-line no-useless-constructor
  constructor (
    private http: HttpClient,
    private cookieService: CookieService,
    private apollo: Apollo,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) {}

  ngOnDestroy () {
    if (!this.querySubscription) return
    this.querySubscription.unsubscribe()
  }

  ngOnInit (): void {
    this.loading = true
    this.stateProgress = 'query'

    this.filesQuery = this.apollo.watchQuery({
      query: gql`
      {
        files {
            createdOn
            name
            shared
            type
            lastModified
            size
            originalSize
            crypted
            compressed
            pubId
        }
      }
      `
    })

    this.querySubscription = this.filesQuery
      .valueChanges
      .subscribe((result: any) => {
        this.sizeTotal = 0
        if (result.data) {
          this.files = result.data.files
          this.dataSource = new MatTableDataSource(result.data.files)
          this.dataSource.sort = this.sort
          for (const x of this.files) {
            this.sizeTotal += x.size
          }
          this.stateProgress = 'determinate'
          this.loading = false
        }
      })
  }
}

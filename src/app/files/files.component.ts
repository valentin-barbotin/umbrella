import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { IData } from '../interfaces/file'
import { IFolder } from '../interfaces/folder'
import { FileService } from '../services/file.service'
import { UserService } from '../services/user.service'
import { CookieService } from 'ngx-cookie-service'
import { Apollo, gql } from 'apollo-angular'
import { ProgressBarMode } from '@angular/material/progress-bar'
import { MatSort } from '@angular/material/sort'
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

  hoveredElement?: string;

  pickedElements: Set<string> = new Set()
  pickedElementsTotalSize : number = 0

  stateUploading: ProgressBarMode = 'indeterminate'
  stateFixed: ProgressBarMode = 'determinate'

  displayedColumns = ['name', 'size', 'type', 'createdOn']

  getProgressState () {
    return this.FileService.stateProgress ? this.stateUploading : this.stateFixed
  }

  isFile (id: string) {
    const element = this.FileService.dataSource.data.find(x => x.pubId === id)
    if (!element) return false
    return element.__typename === 'files'
  }

  isFolder (id: string) {
    const element = this.FileService.dataSource.data.find(x => x.pubId === id)
    if (!element) return false
    return element.__typename === 'folder'
  }

  isItPicked (id: string) {
    return this.pickedElements?.has(id)
  }

  clickOnElem (elem: IData, event: MouseEvent) {
    this.pickFile(event, elem)
  }

  doubleClickOnElem (elem: IFolder) {
    if (elem.type) return this.download(elem.name, elem.pubId)

    this.clickOnFolder(elem)
    this.getData()
  }

  clickOnFolder (folder: IFolder) {
    if (folder.pubId === this.FileService.currentFolder) return
    this.FileService.currentFolder = folder.pubId

    const checkIfInCurrentPath = this.FileService.currentPath.findIndex(x => x.pubId === folder.pubId)
    if (checkIfInCurrentPath > -1) {
      this.FileService.currentPath = this.FileService.currentPath.slice(0, checkIfInCurrentPath + 1)
    } else {
      this.FileService.currentPath.push(folder)
    }

    this.getData()
  }

  clearFolderPath () {
    this.FileService.currentFolder = 'root'
    this.FileService.currentPath = []
    this.getData()
  }

  returnToParentFolder () {
    this.FileService.currentFolder = this.FileService.currentPath.pop()?.parent ?? 'root'
    this.getData()
  }

  /**
   * Return all pubId of the files
   */
  getIDs (set: Set<string>) {
    const items = []
    for (const element of [...set]) {
      items.push(
        this.FileService.files.find(x => x.name === element)?.pubId
      )
    }
    return items
  }

  /**
   * Return the pubId of the file
   */
  getID (set: Set<string>) {
    const selection = set.values().next().value
    return this.FileService.files.find(x => x.name === selection)?.pubId
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

    const pubId = this.pickedElements.values().next().value
    if (!this.isFile(pubId)) return

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
      data: {
        folder: this.FileService.currentFolder
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      this.getData()
      console.log('The dialog was closed')
    })
  }

  applyFilter (event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.FileService.dataSource.filter = filterValue.trim().toLowerCase()
  }

  deleteFiles () {
    if (!this.pickedElements) return
    const amount = this.pickedElements.size
    if (amount === 0) return

    const elements = [...this.pickedElements.values()]
    const tmpData = this.FileService.dataSource.data.filter(x => elements.includes(x.pubId))
    const folders = tmpData.filter(x => this.isFolder(x.pubId)).map(x => x.pubId)
    const files = tmpData.filter(x => this.isFile(x.pubId)).map(x => x.pubId)

    const res = confirm(`Do you really want to delete ${amount} element(s). This action is irreversible`)
    if (!res) return

    this.apollo.mutate({
      mutation: gql`
        mutation deleteElements($folders: [String]!, $files: [String]!) {
          deleteFolders(folders: $folders)
          deleteFiles(files: $files)
        }
      `,
      variables: {
        folders,
        files
      }
    })
      .subscribe(
        (result: any) => {
          this.snackBar.open('Elements deleted', 'OK')
          this.getData()
        }
      )

    // this.cookieService.set('fileselection', JSON.stringify(elements))

    // this.http.delete(
    //   `${environment.api}files/delete`,
    //   {
    //     reportProgress: true,
    //     withCredentials: true
    //   }
    // ).subscribe(
    //   (response) => {
    //     this.snackBar.open(`${amount} files have been deleted`, 'Ok', {
    //       duration: 10000
    //     })

    //     this.getData()
    //   },
    //   (error: HttpErrorResponse) => {
    //     console.log(error)
    //   }
    // )
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

  download (file?: string, pubId?: string) {
    if (pubId && file) {
      this.http.get(
        `${environment.api}files/download/${pubId}`,
        {
          responseType: 'blob',
          reportProgress: true,
          withCredentials: true,
          observe: 'response'
        }
      ).subscribe(
        (response) => {
          const data = response.body
          if (!data) return
          const fileName = response.headers.get('x-filename') ?? 'default'
          this.responseToBlob(data, fileName)
        },
        (error: HttpErrorResponse) => {
          console.log(error)
        }
      )
      return
    }

    if (!this.pickedElements) return

    if (this.pickedElements.size === 1) {
      const pubId = this.pickedElements.values().next().value
      if (!pubId) return

      this.http.get(
        `${environment.api}files/download/${pubId}`,
        {
          responseType: 'blob',
          reportProgress: true,
          withCredentials: true,
          observe: 'response'
        }
      ).subscribe(
        (response) => {
          const data = response.body
          if (!data) return
          const fileName = response.headers.get('x-filename') ?? 'default'
          this.responseToBlob(data, fileName)
        },
        (error: HttpErrorResponse) => {
          console.log(error)
        }
      )
      return
    }

    this.cookieService.set('fileselection', JSON.stringify([...this.pickedElements.values()]))

    this.http.get(
      `${environment.api}files/download`,
      {
        responseType: 'blob',
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
        this.responseToBlob(response, nanoid() + '.zip')
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
    const id = file.pubId
    const size = file.size
    const ctrlKey = event.ctrlKey
    const metaKey = event.metaKey

    if (!ctrlKey && !metaKey) {
      this.pickedElementsTotalSize = 0
      this.pickedElements.clear()
    }

    if (this.pickedElements.has(id)) {
      if (file.type) this.pickedElementsTotalSize -= size
      this.pickedElements.delete(id)
      return
    }

    if (file.type) this.pickedElementsTotalSize += size
    this.pickedElements.add(id)
  }

  getData () {
    if (!this.FileService.dataQuery) return
    const user = this.UserService.User
    if (!user) return
    this.pickedElements?.clear()
    this.pickedElementsTotalSize = 0
    this.FileService.stateProgress = 'query'
    this.FileService.dataQuery.refetch({
      folder: this.FileService.currentFolder,
      username: user.username
    }).then(
      () => {
        // this.FileService.updateDataSource()
        this.FileService.stateProgress = 'determinate'
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
        const fileExists = this.FileService.files.filter(x =>
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

    this.FileService.stateProgress = 'indeterminate'

    if (this.FileService.sizeTotal + totalSize > this.FileService.sizeLimit) {
      this.snackBar.open('No enough space available', 'OK', {
        duration: 10000
      })
      return
    }

    form.append('folder', this.FileService.currentFolder ?? 'root')

    this.http.post(
      `${environment.api}files/upload`,
      form,
      {
        reportProgress: true,
        withCredentials: true
      }
    ).subscribe(
      (response) => {
      },
      (error) => {
        console.log(error)
      },
      () => {
        this.snackBar.open(`${amount} files have been uploaded`, 'Ok', {
          duration: 10000
        })
        this.getData()
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
    private dialog: MatDialog,
    public FileService: FileService,
    private UserService: UserService
  ) {
  }

  ngOnDestroy () {
    // if (!this.queryFilesSubscription) return
    // this.queryFilesSubscription.unsubscribe()
  }

  ngOnInit (): void {
  }

  ngAfterViewInit () {
  }
}

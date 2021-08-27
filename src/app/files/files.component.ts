/* eslint-disable max-lines */
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
  pickedElementsTotalSize = 0

  stateUploading: ProgressBarMode = 'indeterminate'
  stateFixed: ProgressBarMode = 'determinate'

  displayedColumns = ['name',
      'size',
      'type',
      'createdOn']

  getProgressState (): ProgressBarMode {
      return this.FileService.stateProgress
          ? this.stateUploading
          : this.stateFixed
  }

  /**
   * Check if the element is a file
   * @param {string} id
   * @returns {boolean}
   */
  isFile (id: string): boolean {
      const element = this.FileService.dataSource.data.find((x) => x.pubId === id)
      if (!element) return false
      // eslint-disable-next-line no-underscore-dangle
      return element.__typename === 'files'
  }

  /**
   * Check if the element is a folder
   * @param {string} id
   * @returns {boolean}
   */
  isFolder (id: string): boolean {
      const element = this.FileService.dataSource.data.find((x) => x.pubId === id)
      if (!element) return false
      // eslint-disable-next-line no-underscore-dangle
      return element.__typename === 'folder'
  }

  /**
   * Check if the element is picked by the user
   * @param {string} id
   * @returns {boolean}
   */
  isItPicked (id: string): boolean {
      return this.pickedElements?.has(id)
  }

  /**
   * Used to pick an element
   * @param {IData} elem
   * @param {MouseEvent} event
   * @returns {void}
   */
  clickOnElem (elem: IData, event: MouseEvent): void {
      this.pickFile(event, elem)
  }

  /**
   * Download the file by his pubId if it's one, or enter in folder if it's a folder
   * @param {IFolder} elem
   * @returns {void}
   */
  doubleClickOnElem (elem: IFolder): void {
      if (elem.type) {
          this.download(elem.name, elem.pubId)
          return
      }

      this.clickOnFolder(elem)
      this.getData()
  }

  /**
   * Enter in folder and retrieve the data from the server
   * @param {IFolder} folder
   * @returns {void}
   */
  clickOnFolder (folder: IFolder): void {
      if (folder.pubId === this.FileService.currentFolder) return
      this.FileService.currentFolder = folder.pubId

      const checkIfInCurrentPath = this.FileService.currentPath.findIndex((x) => x.pubId === folder.pubId)
      if (checkIfInCurrentPath > -1) {
          this.FileService.currentPath = this.FileService.currentPath.slice(0, checkIfInCurrentPath + 1)
      } else {
          this.FileService.currentPath.push(folder)
      }

      this.getData()
  }

  /**
   * Set the user path to root
   * @returns {void}
   */
  clearFolderPath (): void {
      this.FileService.currentFolder = 'root'
      this.FileService.currentPath = []
      this.getData()
  }

  /**
   * Set the user path to the parent of the current folder
   * @returns {void}
   */
  returnToParentFolder (): void {
      this.FileService.currentFolder = this.FileService.currentPath.pop()?.parent ?? 'root'
      this.getData()
  }

  /**
   * Return all pubId of the files
   * @returns {(string | undefined)[]}
   */
  getIDs (set: Set<string>): (string | undefined)[] {
      const items = []
      for (const element of [...set]) {
          items.push(this.FileService.files.find((x) => x.name === element)?.pubId)
      }
      return items
  }

  /**
   * Return the pubId of the file
   * @returns {string | undefined}
   */
  getID (set: Set<string>): string | undefined {
      const selection = set.values().next().value
      return this.FileService.files.find((x) => x.name === selection)?.pubId
  }

  shareFile (): void {
      const selectionSize = this.pickedElements.size
      const sharingMsg = `You are about to share ${selectionSize} files. Are you sure?`
      //   const dialogRef = this.dialog.open(ShareDialogComponent, {
      //       data: {
      //           sharingMsg,
      //           pickedElements: this.pickedElements,
      //           pickedElementsTotalSize: this.pickedElementsTotalSize
      //       }
      //   })

      if (selectionSize === 0) {
          this.snackBar.open('No selection', 'OK')
          return
      }
      if (selectionSize > 1) {
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
      }).
          valueChanges.
          subscribe((result: any) => {
              const key = result.data.filesharing
              const fullLink = `${environment.api}files/download/${pubId}?key=${key}`
              navigator.clipboard.writeText(fullLink)
              this.snackBar.open(fullLink, 'OK')
          })
  }

  /**
   * Open a dialog to create a new folder inside the current one
   * @returns {void}
   */
  createFolder (): void {
      const dialogRef = this.dialog.open(createFolderComponent, {
          data: {
              folder: this.FileService.currentFolder
          }
      })

      dialogRef.afterClosed().subscribe((result) => {
          this.getData()
          console.log('The dialog was closed')
      })
  }

  /**
   * Apply filters to the datasource for rendering in list
   * @param {Event} event
   * @returns {void}
   */
  applyFilter (event: Event): void {
      const filterValue = event.target as HTMLInputElement
      this.FileService.dataSource.filter = filterValue.value.trim().toLowerCase()
  }

  /**
   * Ask confirmation to delete elements, and delete them from server if the user confirms
   * @returns {void}
   */
  deleteFiles (): void {
      if (!this.pickedElements) return
      const amount = this.pickedElements.size
      if (amount === 0) return

      const elements = [...this.pickedElements.values()]
      const tmpData = this.FileService.dataSource.data.filter((x) => elements.includes(x.pubId))
      const folders = tmpData.filter((x) => this.isFolder(x.pubId)).map((x) => x.pubId)
      const files = tmpData.filter((x) => this.isFile(x.pubId)).map((x) => x.pubId)

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
      }).
          subscribe((result: any) => {
              this.snackBar.open('Elements deleted', 'OK')
              this.getData()
          })
  }

  /**
   * Take the file and download it
   * @param {Blob} binaryData
   * @param {string} file
   * @param {string} type
   * @returns {void}
   */
  responseToBlob (binaryData: Blob, file: string, type: string): void {
      const downloadLink = document.createElement('a')
      const blob = new Blob([binaryData], { type })
      downloadLink.href = window.URL.createObjectURL(blob)
      if (file) {
          downloadLink.setAttribute('download', file)
      }
      document.body.appendChild(downloadLink)
      downloadLink.click()
  }

  /**
   * Start the download of file(s)
   * @param {string} file?
   * @param {string} pubId?
   * @returns {any}
   */
  download (file?: string, pubId?: string): void {
      let fileName = ''
      let type = ''

      // Double click on a file
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
                  fileName = response.headers.get('x-filename') ?? 'default'
                  type = response.headers.get('content-type') ?? 'application/octet-stream'
                  console.log(data)
                  this.responseToBlob(data, fileName, type)
              },
              (error: HttpErrorResponse) => {
                  console.log(error)
              }
          )
          return
      }

      if (!this.pickedElements) return

      // Download button when there is a single selection of file
      if (this.pickedElements.size === 1) {
          const id = this.pickedElements.values().next().value
          console.log(this.pickedElements.values())

          if (!id) return

          this.http.get(
              `${environment.api}files/download/${id}`,
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
                  fileName = response.headers.get('x-filename') ?? 'default'
                  type = response.headers.get('content-type') ?? 'application/octet-stream'
                  this.responseToBlob(data, fileName, type)
              },
              (error: HttpErrorResponse) => {
                  console.log(error)
              }
          )
          return
      }


      // Download button when there is a multiple selection of file, receive a zip
      const elements = [...this.pickedElements.values()]
      for (const elem of elements) {
          if (this.isFolder(elem)) {
              this.snackBar.open('Cannot download folders', 'OK', { duration: 3000 })
              return
          }
      }

      this.cookieService.set(
          'fileselection',
          JSON.stringify(elements),
          new Date(Date.now() + 3600),
          '/',
          environment.domain,
          true
      )

      this.http.get(
          `${environment.api}files/download`,
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
              fileName = response.headers.get('x-filename') ?? 'default'
              type = response.headers.get('content-type') ?? 'application/octet-stream'
              this.responseToBlob(data, `${nanoid()}.zip`, type)
          },
          (error: HttpErrorResponse) => {
              console.log(error)
          }
      )
  }

  /**
   * Start the download of the selection of files
   * @returns {void}
   */
  downloadSelection (): void {
      if (!this.pickedElements) return
      this.download()
  }

  /**
   * Add or remove an element from the selection
   * @param {MouseEvent} event
   * @param {IData} file
   * @returns {void}
   */
  pickFile (event: MouseEvent, file: IData): void {
      const {pubId, size} = file
      const {ctrlKey, metaKey} = event

      if (this.pickedElements.has(pubId)) {
          if (file.type) this.pickedElementsTotalSize -= size

          if (this.pickedElements.size > 1) {
              this.pickedElementsTotalSize = 0
              this.pickedElements.clear()

              if (file.type) this.pickedElementsTotalSize += size
              this.pickedElements.add(pubId)
          } else {
              this.pickedElements.delete(pubId)
          }
          return
      }

      if (!ctrlKey && !metaKey) {
          this.pickedElementsTotalSize = 0
          this.pickedElements.clear()
      }

      if (file.type) this.pickedElementsTotalSize += size
      this.pickedElements.add(pubId)
  }

  /**
   * Fetch the backend to get the data of the current folder, (bypass local graphql cache)
   * @returns {void}
   */
  getData (): void {
      if (!this.FileService.dataQuery) return
      const user = this.UserService.User
      if (!user) return
      this.pickedElements?.clear()
      this.pickedElementsTotalSize = 0
      this.FileService.stateProgress = 'query'
      this.FileService.dataQuery.refetch({
          folder: this.FileService.currentFolder,
          username: user.username
      }).then(() => {
          // This.FileService.updateDataSource()
          this.FileService.stateProgress = 'determinate'
      })
  }

  /**
   * Take user selections of files, and send them to the backend
   * @param {HTMLInputElement} elem
   * @returns {void}
   */
  uploadFile (elem: HTMLInputElement): void {
      const {files} = elem

      if (!files) return

      let totalSize = 0
      const form = new FormData()

      let amount = 0
      for (let i = 0; i < files.length; i++) {
          const file = files.item(i)
          if (!file) return
          if (!this.checkFile(file)) {
              this.snackBar.open('Invalid file', 'OK')
              return
          }
          const fileExists = this.FileService.files.filter((x) => x.name === file.name)

          let replace = true
          if (fileExists.length > 0) {
              if (!confirm(`${file.name} is already in this folder, do you want to replace it ?`)) {
                  replace = false
              }
          }

          if (replace) {
              totalSize += file.size
              form.append(`file${i}`, file)
              ++amount
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
          (response) => {},
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

  /**
   * Check a single file for mime type and size
   * @param {globalThis.File} file
   * @returns {boolean}
   */
  checkFile (file: globalThis.File): boolean {
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
    // eslint-disable-next-line no-shadow
    public FileService: FileService,
    // eslint-disable-next-line no-shadow
    private UserService: UserService
  ) {}

  ngOnDestroy () {

      /*
       * If (!this.queryFilesSubscription) return
       * this.queryFilesSubscription.unsubscribe()
       */
  }

  ngOnInit (): void {
  }

  ngAfterViewInit () {
  }
}

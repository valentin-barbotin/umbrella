import { Injectable, ViewChild } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { Router } from '@angular/router'
import { Apollo, gql, QueryRef } from 'apollo-angular'
import { Subscription } from 'rxjs'
import { IData } from '../interfaces/file'
import { IFolder } from '../interfaces/folder'
import { UserService } from './user.service'

interface GET_DATA_QUERY_RESPONSE {
  data: {
    files: IData[]
    folders: IFolder[]
    storageUsed: number
    storageMax: number
  }
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  @ViewChild(MatSort) sort!: MatSort;
  sizeLimit: number = 0;
  sizeTotal: number = 0;
  stateProgress = 'determinate';

  files: IData[] = []
  folders: IFolder[] = []

  dataQuery?: QueryRef<any, { folder: string, username: string; }>
  queryDataSubscription?: Subscription;
  dataSource = new MatTableDataSource<any>([]);

  currentFolder: string = 'root'
  currentPath: IFolder[] = [];

  calcUsedStorage () {
    return (this.sizeTotal / this.sizeLimit) * 100
  }

  updateDataSource () {
    this.dataSource = new MatTableDataSource(
      [...this.folders, ...this.files]
    )
    this.dataSource.sort = this.sort
    // this.stateProgress = 'determinate'
    // this.loading = false
  }

  constructor (
    private apollo: Apollo,
    private UserService: UserService,
    private router: Router
  ) {
    const user = this.UserService.User
    if (!user) {
      router.navigate(['/login'])
      return
    }
    const GET_DATA_QUERY = gql`
      query datas($folder: String, $username: String) {
          folders(folder: $folder) {
              name
              pubId
              parent
          },
          files(folder: $folder) {
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
        },
        storageUsed(username: $username)
        storageMax(username: $username)
      }
    `

    this.dataQuery = this.apollo.watchQuery({
      query: GET_DATA_QUERY,
      variables: {
        folder: 'root',
        username: user.username
      }
    })

    this.queryDataSubscription = this.dataQuery
      .valueChanges
      .subscribe((result: GET_DATA_QUERY_RESPONSE) => {
        this.sizeTotal = 0
        this.sizeLimit = 0
        if (result.data) {
          this.files = result.data.files
          this.folders = result.data.folders
          this.sizeTotal = (result.data.storageUsed > 0) ? result.data.storageUsed : 0
          this.sizeLimit = result.data.storageMax
          this.updateDataSource()
        }
      })
  }
}

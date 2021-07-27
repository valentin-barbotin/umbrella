import { Injectable } from '@angular/core'
import { User } from '../user'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public get User () {
    const user = localStorage.getItem('user')
    if (user) {
      return JSON.parse(user) as User
    }
    return null
  }
}

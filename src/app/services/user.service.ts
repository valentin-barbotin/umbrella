import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Apollo, gql } from 'apollo-angular'
import { User } from '../user'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    // eslint-disable-next-line no-useless-constructor
    constructor (
    private readonly snackBar: MatSnackBar,
    private readonly apollo: Apollo
    ) { }

    public get User (): User | null {
        const user = localStorage.getItem('user')
        if (user) {
            return JSON.parse(user) as User
        }
        return null
    }

    /**
     * Try to create a user from server
     * @param {Record<string} variables
     * @param {any} unknown>
     * @returns {Promise<number>}
     */
    createUser (variables: Record<string, any>): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const query = gql`
            mutation createUser($username: String!, $email: String!, $password: String!) {
                createUser(username: $username, email: $email, password: $password)
            }`
            this.apollo.mutate({
                mutation: query,
                variables
            }).subscribe(
                (response: any) => {
                    resolve(response.data.createUser)
                },
                (error) => {
                    reject(error)
                    console.log(error)
                }
            )
        })
    }

    checkOTP (code: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const user = this.User
            if (!user) {
                resolve(false)
                return
            }

            const query = gql`
                mutation checkOTP($username: String!, $code: String!) {
                checkOTP(username: $username, code: $code)
                }`

            this.apollo.mutate({
                mutation: query,
                variables: {
                    username: user.username,
                    code
                }
            }).subscribe(
                (response: any) => {
                    resolve(response.data.checkOTP)
                    this.snackBar.open('Validated', 'OK', {
                        duration: 5000
                    })
                },
                (error) => {
                    reject(error)
                    console.log(error)
                }
            )
        })
    }

    /**
     * Remove MFA from an account
     * @returns {any}
     */
    removeOTP (): void {
        const user = this.User
        if (!user) return
        const query = gql`
            mutation removeOTP($username: String!) {
                removeOTP(username: $username)
            }`

        this.apollo.mutate({
            mutation: query,
            variables: {
                username: user.username
            }
        }).subscribe(
            (response: any) => {
                this.snackBar.open('2FA removed', 'OK', {
                    duration: 5000
                })
            },
            (error) => {
                console.log(error)
            }
        )
    }

    /**
     * Generate an OTP for an account without enable MFA
     * @returns {Promise<string>}
     */
    generateOTP (): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const user = this.User
            if (!user) return

            const query = gql`
                mutation generateOTP($username: String!) {
                    generateOTP: generateOTP(username: $username)
                }`

            this.apollo.mutate({
                mutation: query,
                variables: {
                    username: user.username
                }
            }).subscribe(
                (response: any) => {
                    const token = response.data.generateOTP
                    resolve(token)
                    console.log(token)
                },
                (error) => {
                    reject(error)
                    console.log(error)
                }
            )
        })
    }

    /**
     * Activate MFA for an account
     * @returns {void}
     */
    validateOTP (): void {
        const user = this.User
        if (!user) return
        const query = gql`
            mutation validateOTP($username: String!) {
                validateOTP(username: $username)
            }`

        this.apollo.mutate({
            mutation: query,
            variables: {
                username: user.username
            }
        }).subscribe(
            (response: any) => {},
            (error) => {
                console.log(error)
            }
        )
    }
}

export interface User {
    username: string;
    email: string;
    active: boolean;
    date: Date;
    container?: string;
    mfa: boolean;
    sub: string
}

import { HTTP_INTERCEPTORS } from '@angular/common/http'

import { CheckSessionInterceptor } from './interceptors/check-session.interceptor'

export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS,
        useClass: CheckSessionInterceptor,
        multi: true}
]

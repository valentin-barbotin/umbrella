import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AppComponent } from './app.component'
import { AuthGuard } from './auth.guard'
import { DashboardComponent } from './dashboard/dashboard.component'
import { FilesComponent } from './files/files.component'
import { LoginComponent } from './login/login.component'
import { LogoutComponent } from './logout/logout.component'
import { RegisterComponent } from './register/register.component'
import { SettingsComponent } from './settings/settings.component'

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'files', component: FilesComponent },
      { path: 'settings', component: SettingsComponent }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'files', component: FilesComponent },
  { path: 'register', component: RegisterComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

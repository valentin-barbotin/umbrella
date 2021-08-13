import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { resetPassword } from './login/resetPassword';
import { RegisterComponent } from './register/register.component';

import { MatTreeModule } from '@angular/material/tree';

// Material Form Controls
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// Material Navigation
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
// Material Layout
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';

// Material Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
// Material Popups & Modals
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

/*
 * Import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
 * import { TranslateHttpLoader } from '@ngx-translate/http-loader';
 */
import { createFolderComponent } from './files/createFolder.component';
import { FilesComponent } from './files/files.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutComponent } from './logout/logout.component';

import { CookieService } from 'ngx-cookie-service';
import { BytesConverterPipe } from './pipes/bytes-converter.pipe';
import { MimeNamePipe } from './mime-name.pipe';
import { httpInterceptorProviders } from './http-interceptors';
import { GraphQLModule } from './graphql.module';
import { SettingsComponent } from './settings/settings.component';
import { SettingsAccountComponent, delAccount } from './settings-account/settings-account.component';
import { dualAuth, SettingsSecurityComponent } from './settings-security/settings-security.component';
import { SettingsSubscriptionComponent } from './settings-subscription/settings-subscription.component';
import { QRCodeModule } from 'angularx-qrcode';

/*
 * Export function HttpLoaderFactory(http: HttpClient) {
 *   return new TranslateHttpLoader(http);
 * }
 */

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        FilesComponent,
        SettingsComponent,
        SettingsAccountComponent,
        SettingsSecurityComponent,
        SettingsSubscriptionComponent,
        DashboardComponent,
        LogoutComponent,
        BytesConverterPipe,
        MimeNamePipe,
        resetPassword,
        createFolderComponent,
        delAccount,
        dualAuth
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,

        MatAutocompleteModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        MatCardModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatListModule,
        MatStepperModule,
        MatTabsModule,
        MatTreeModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatBadgeModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatRippleModule,
        MatBottomSheetModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        GraphQLModule,
        QRCodeModule

    ],
    providers: [
        CookieService,
        httpInterceptorProviders
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

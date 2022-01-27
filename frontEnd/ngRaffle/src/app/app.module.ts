import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashComponent } from './components/dash/dash.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { RegistrationComponent } from './components/registration/registration.component';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { AlertModule } from './components/alert';
import { OtpComponent } from './components/otp/otp.component';
import { CheckerComponent } from './components/checker/checker.component';
import { MustMatchDirective } from './components/mustMatch/must-match.directive';
import { ProfileComponent } from './components/profile/profile.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderComponent } from './components/header/header.component';
import { BodyComponent } from './components/body/body.component';
import { BarcodeScannerLivestreamModule } from "ngx-barcode-scanner";


const appRoutes: Routes = [
  { path: '', component: CheckerComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'verifyOtp', component: OtpComponent },
  { path: 'profile', component: ProfileComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    DashComponent,
    LoginComponent,
    RegistrationComponent,
    OtpComponent,
    CheckerComponent,
    MustMatchDirective,
    ProfileComponent,
    PopUpComponent,
    HeaderComponent,
    BodyComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { enableTracing: true }),
    BrowserAnimationsModule,
    MatSliderModule, MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, LayoutModule,
    FormsModule,
    AlertModule,
    MatDialogModule,
    FlexLayoutModule,
    MatToolbarModule,
    BarcodeScannerLivestreamModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }

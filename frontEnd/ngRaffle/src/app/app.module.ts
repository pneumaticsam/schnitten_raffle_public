import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule , Routes} from '@angular/router';
import {MatSliderModule } from '@angular/material/slider';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { DashComponent } from './components/dash/dash.component';
import { MatGridListModule } from '@angular/material/grid-list';
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


const appRoutes:Routes =  [
  {path:'', component:CheckerComponent},
  {path:'login', component:LoginComponent},
  {path:'register', component:RegistrationComponent},
  {path:'verifyOtp', component:OtpComponent},
]

@NgModule({
  declarations: [
    AppComponent,
    DashComponent,
    LoginComponent,
    RegistrationComponent,
    OtpComponent,
    CheckerComponent,
    ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes,{enableTracing:true}),
    BrowserAnimationsModule,
    MatSliderModule, MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, LayoutModule,
    FormsModule,
    AlertModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }

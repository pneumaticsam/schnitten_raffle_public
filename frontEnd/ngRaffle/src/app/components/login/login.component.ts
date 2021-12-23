import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Login } from 'src/app/models/login';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services';
import { AlertService } from '../alert';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading = false;
  submitted = false;
  returnUrl: string ="/";

  constructor(   
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) {

            // redirect to home if already logged in
            if (this.authenticationService.currentUserValue) {
              this.router.navigate(['/']);
          }
     }

  ngOnInit(): void {
    
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  model=new Login();

  onSubmit(f: NgForm) {
    this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (f.invalid) {
          console.log('form is NOT valid!!!');
          
            return;
        }
console.log(f);
        this.loading = true;
        this.authenticationService.login(f.controls['phone'].value, f.controls['password'].value)
            .pipe(first())
            .subscribe(
                data => {
                  console.log(data)
                  var options = {
                    autoClose: false,
                    keepAfterRouteChange: true
                  }

                  this.alertService.info(`Welcome, you can now check your raffle codes!`, options);
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                  console.log('error here');
                  
                  console.log(error)
                  if(error.status == 0){
                    this.alertService.error(`Server may be down`);
                  }else{
                  this.alertService.error(error.error);
                  }
                  this.loading = false; 
                });
    }
}
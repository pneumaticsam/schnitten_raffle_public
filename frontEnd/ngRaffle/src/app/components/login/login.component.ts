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
    private alertService: AlertService) { }

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
            return;
        }
console.log(f);
        this.loading = true;
        this.authenticationService.login(f.controls['phone'].value, f.controls['password'].value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false; 
                });
    }
}
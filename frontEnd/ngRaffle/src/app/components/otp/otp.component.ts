import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { UserService } from 'src/app/services';
import { AlertService } from '../alert';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {

  loading = false;
  submitted = false;
  returnUrl: string ="/";
  otpData?:string;
  constructor(   
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService) { }

  ngOnInit(): void {
  }

  
  onSubmit(f: NgForm) {

    console.log(`OTP submission... with data ${f.controls}`)
    this.submitted = true;

        // stop here if form is invalid
        if (f.invalid) {
            return;
        }
console.log(f);
        this.loading = true;
        this.userService.verify({otp:f.controls['otp'].value,id: this.route.snapshot.queryParams["id"]})
            .pipe(first())
            .subscribe(
                data => {
                  console.log(data)
                  this.alertService.success(`User Registration Successful`)
                  this.alertService.info(`Login to continue`)
                  this.returnUrl="/";
                  this.router.navigate([this.returnUrl]);
                },
                error => {
                  console.log(error.error)
                    this.alertService.error(error.error);
                    this.loading = false;
                });

                console.log('done submission!');
    }


}

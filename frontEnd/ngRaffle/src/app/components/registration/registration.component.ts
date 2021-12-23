import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { Login } from 'src/app/models/login';
import { UserService } from 'src/app/services';
import { AlertService } from '../alert';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  loading = false;
  submitted = false;
  returnUrl: string ="/";
  constructor(   
    private dialogRef:MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService) { }

  ngOnInit(): void {
  }  
  model=new Login();

  
  openDialog(){
    this.dialogRef.open(PopUpComponent);
  }

  onSubmit(f: NgForm) {

    console.log(`Registation submission... with data ${f.controls}`)
    this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (f.invalid) {
          console.log(`form not valid`)
          console.log(f.errors)
            return;
        }
console.log(f);

        this.loading = true;
        this.userService.register({phone:f.controls['phone'].value,password: f.controls['password'].value})
            .pipe(first())
            .subscribe(
                data => {
                  console.log(data)
                  var options = {
                    autoClose: false,
                    keepAfterRouteChange: true
                  }
                  this.alertService.info(`Use the OTP to complete your registration: ${data.otp}`,options)
                  this.returnUrl="/verifyOtp";
                  this.router.navigate([this.returnUrl], {queryParams:{id:data.id}});
                },
                error => {
                  console.log(error.error)
                    this.alertService.error(error.error);
                    this.loading = false;
                });

                console.log('done submission!');
    }

}

// 424500
// 297213



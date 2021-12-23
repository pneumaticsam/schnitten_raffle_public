import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { UserProfile } from 'src/app/models/user';
import { UserService } from 'src/app/services';
import { AlertService } from '../alert';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  loading = false;
  submitted = false;
  returnUrl: string ="/";

  ngOnInit(): void {
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService) { }
  
    model=new UserProfile();
  onSubmit(f: NgForm) {

    console.log(`Registation submission... with data ${f.controls}`)
    // this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (f.invalid) {
            return;
        }
console.log(f);

        // this.loading = true;
        this.userService.profileUpdate(
          {
            firstName:f.controls['firstName'].value,
            lastName: f.controls['lastName'].value,
            addressLine1:f.controls['addressLine1'].value,
            addressLine2:f.controls['addressLine2'].value,
            zipCode:f.controls['zipCode'].value
          })
            .pipe(first())
            .subscribe(
                data => {
                  console.log(data)
                  var options = {
                    autoClose: false,
                    keepAfterRouteChange: true
                  }
                  this.alertService.info(`Profile updated successfully`, options)
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
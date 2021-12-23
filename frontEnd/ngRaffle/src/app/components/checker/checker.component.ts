import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { RaffleCheckData, RaffleCheckResponse } from 'src/app/models/raffleCheckData';
import { AuthenticationService, RaffleService } from 'src/app/services';
import { AlertService } from '../alert';

@Component({
  selector: 'app-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.css']
})
export class CheckerComponent implements OnInit {


  loading = false;
  submitted = false;
  returnUrl: string ="/";
  rCodeData?:string;
  constructor(   
    private route: ActivatedRoute,
    private router: Router,
    private raffleService: RaffleService,
    private alertService: AlertService,
    private authenticationService:AuthenticationService){

            // redirect to home if already logged in
            if (!this.authenticationService.currentUserValue) {
              this.router.navigate(['login']);
            }

     }

  ngOnInit(): void {
  }

 
  
  onSubmit(f: NgForm) {

    console.log(`Code Check submission... with data ${f.controls}`)
    this.submitted = true;

        // stop here if form is invalid
        if (f.invalid) {
            return;
        }
        
        
        this.loading = true;
        const cdata = new RaffleCheckData(f.controls['raffle-code'].value,"")
        this.raffleService.checkCode(cdata)
            .pipe(first<RaffleCheckResponse>())
            .subscribe(
                data => {
                  console.log('SUCCESS')
                  console.log(data)
                  this.alertService.info(data.desc);
                  if(!data.checkID || data.checkID==""){
                    console.log('profile already captured... skipping profile capture');
                    location.href=location.href
                    //this.router.navigate([this.returnUrl]);

                  }else{
                  this.returnUrl="/profile";
                  this.router.navigate([this.returnUrl], {queryParams:{winingID:data.checkID}});
                  }
                },
                error => {
                  console.log('FAILURE')

                  console.log(error.error)
                    this.alertService.error(error.error.desc);
                    this.loading = false;
                });

                console.log('done submission!');
    }

    public logOut= ()=> {
      console.log("logging out ...")
      localStorage.removeItem('currentUser');
      //this.router.navigate(['login']);
      location.reload();
    }

}

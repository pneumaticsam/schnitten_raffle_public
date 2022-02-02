import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuaggaJSResultObject } from '@ericblade/quagga2';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { defer } from 'rxjs';
import { first } from 'rxjs/operators';
import { RaffleCheckData, RaffleCheckResponse } from 'src/app/models/raffleCheckData';
import { AuthenticationService, RaffleService } from 'src/app/services';
import { AlertService } from '../alert';

@Component({
  selector: 'app-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.css']
})
export class CheckerComponent implements AfterViewInit, OnInit {


  loading = false;
  submitted = false;
  returnUrl: string = "/";
  rCodeData?: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private raffleService: RaffleService,
    private alertService: AlertService,
    private authenticationService: AuthenticationService) {

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
    const cdata = new RaffleCheckData(f.controls['raffle-code'].value, "")
    this.raffleService.checkCode(cdata)
      .pipe(first<RaffleCheckResponse>())
      .subscribe(
        data => {
          console.log('SUCCESS')
          console.log(data)
          this.alertService.info(data.desc);
          if (!data.checkID || data.checkID == "") {
            console.log('profile already captured... skipping profile capture');
            //location.href = location.href

            this.router.navigate(["/"]);

          } else {
            this.returnUrl = "/profile";
            this.router.navigate([this.returnUrl], { queryParams: { winingID: data.checkID } });
          }
          f.controls['raffle-code'].reset();
        },
        error => {
          console.log('FAILURE')

          console.log(error.error)
          this.alertService.error(error.error.desc);
          this.loading = false;
          f.controls['raffle-code'].reset();
        });

    console.log('done submission!');
  }

  public logOut = () => {
    console.log("logging out ...")
    localStorage.removeItem('currentUser');
    //this.router.navigate(['login']);
    location.reload();
  }
  public scan = () => {
    console.log("initiating scan ...")
    this.enableScanner = true;
    setTimeout(() => { this.barcodeScanner.start(); }, 500);
  }
  //qrResultString!: String;
  enableScanner: boolean = false;
  public onCodeResult = (resultString: string) => {
    console.log("barcode scan result: " + resultString);
    this.rCodeData = resultString;
  }


  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;

  //barcodeValue!: string | null;

  ngAfterViewInit() {
    //this.barcodeScanner.start();
  }

  onValueChanges(result: QuaggaJSResultObject) {
    console.log(result);

    this.rCodeData = result.codeResult.code ?? "";

    this.barcodeScanner.stop();
    this.enableScanner = false;
  }

  onStarted(started: boolean) {
    console.log("barcode scanner started...");
  }

}

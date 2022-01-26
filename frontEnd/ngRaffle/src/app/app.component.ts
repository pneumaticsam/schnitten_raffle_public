import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ngRaffle';
  isSmallDevice: boolean = false;
  constructor(private breakpointObserver: BreakpointObserver) { }
  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(min-width: 590px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isSmallDevice = false;
          console.log('Viewport is 900px or over!');
        } else {
          this.isSmallDevice = true;
          console.log('Viewport is smaller than 900px!');
        }
      });
  }
}
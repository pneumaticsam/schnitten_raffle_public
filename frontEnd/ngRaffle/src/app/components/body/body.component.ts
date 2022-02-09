import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Observable, fromEvent, Subject, EMPTY } from 'rxjs';

import { map, mergeWith, bufferTime, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {

  }
  ngOnInit(): void {


    var mergedStreams =
      fromEvent(document, "click").pipe(
        mergeWith(
          ...([[document, 'wheel'],
          [document, 'scroll'],
          [document, 'mousemove'],
          [document, 'keyup'],
          [window, 'resize'],
          [window, 'scroll'],
          [window, 'mousemove']].map(e => fromEvent(Object(e[0]), String(e[1]))))
        )
      );

    var idleStream = mergedStreams
      .pipe(bufferTime(10000), filter(function (arr) {
        //console.log(arr);
        return arr.length === 0;
      })
      );

    idleStream.subscribe(this.source);

    this.pausable = this.pauser.pipe(switchMap(paused => paused ? EMPTY : this.source));

    var subscription = this.pausable.subscribe(() => {
      this.showRaffleIntro = true;
      this.pauser.next(true);
      console.log(`PAUSED...`);

    });


  }

  @Input()
  isSmallDevice: boolean = false;

  showRaffleIntro: boolean = true;

  source = new Subject();
  pauser = new Subject();
  pausable!: Observable<unknown>;

  switchView() {
    this.showRaffleIntro = false;
    this.pauser.next(false);
    console.log(`RESUMED...`);

  }
}
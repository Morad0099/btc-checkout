import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  readonly breakpoint = 450;
  isMobile$: Observable<boolean>;

  constructor() {
    // Initialize with current window size
    this.isMobile$ = fromEvent(window, 'resize').pipe(
      startWith(window.innerWidth),
      map(() => window.innerWidth < this.breakpoint),
      distinctUntilChanged()
    );
  }

  // Helper method to check current screen size
  get isMobile(): boolean {
    return window.innerWidth < this.breakpoint;
  }
}
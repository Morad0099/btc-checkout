import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private searchVisibleSubject = new BehaviorSubject<boolean>(false);
  searchVisible$ = this.searchVisibleSubject.asObservable();

  toggleSearch() {
    this.searchVisibleSubject.next(!this.searchVisibleSubject.value);
  }
}
// payment-modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentModalService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  private paymentMethodSubject = new BehaviorSubject<string>('');
  
  showModal$ = this.showModalSubject.asObservable();
  paymentMethod$ = this.paymentMethodSubject.asObservable();

  openModal() {
    this.showModalSubject.next(true);
  }

  closeModal() {
    this.showModalSubject.next(false);
    this.paymentMethodSubject.next('');
  }

  setPaymentMethod(method: string) {
    this.paymentMethodSubject.next(method);
    this.closeModal();
  }
}
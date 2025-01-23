import { Component, HostListener } from '@angular/core';
import { PaymentModalService } from '../services/payment-modal.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-payment-method-modal-two',
  standalone: true,
  imports: [],
  templateUrl: './payment-method-modal-two.component.html',
  styleUrl: './payment-method-modal-two.component.css'
})
export class PaymentMethodModalTwoComponent {
  constructor(private paymentModalService: PaymentModalService, private router: Router) {
    
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    this.close();
  }
  
  selectPayment(paymentType:string){
    this.close();
    if (paymentType == 'bitcoin'){
      this.router.navigate(['/mobile/redirect'])
    }else{
      this.router.navigate(['/mobile/checkout'])
    }
  }

  close(){
    this.paymentModalService.closeModal()
  }
}

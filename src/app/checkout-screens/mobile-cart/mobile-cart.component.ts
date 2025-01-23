import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { State } from '../state/app.state';
import { Observable, map } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { MobilePaymentComponent } from '../mobile-payment/mobile-payment.component';
import { PaymentMethodModalTwoComponent } from '../payment-method-modal-two/payment-method-modal-two.component';
import { PaymentModalService } from '../services/payment-modal.service';

@Component({
  standalone: true,
  selector: 'mobile-cart',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MobilePaymentComponent,
    PaymentMethodModalTwoComponent,
  ],
  templateUrl: 'mobile-cart.component.html',
})
export class MobileCartComponent {
  cart$: Observable<any[]>;
  total = 0;
  loading = false;
  form: FormGroup;
  networks = ['vodafone', 'mtn', 'airteltigo'];

  hasItems: boolean = false;
  showModal: boolean = false;

  constructor(
    private $state: State,
    private fb: FormBuilder,
    private router: Router,
    private $service: AppService,
    public paymentModalService: PaymentModalService
  ) {
    this.cart$ = this.$state.state$.pipe(map((s) => s.payload.cart));

    // Initialize form
    this.form = this.fb.group({
      accountNumber: [null, Validators.required],
      accountIssuer: [null, Validators.required],
      name: [null, Validators.required],
      phone: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
    });

    // Subscribe to cart changes for total
    this.$state.state$.pipe(map((s) => s.payload.cart)).subscribe((cart) => {
      const mappedCart = cart.map((c) => ({
        quantity: c.quantity,
        giftcard: c.giftcard,
        currency: c.currency,
      }));
      this.$service.calculatePrice(mappedCart).subscribe({
        next: (total: number) => (this.total = total),
      });
    });
  }

  get invalid(): boolean {
    const { cart } = this.$state.state.payload;
    return this.form.invalid || cart.length <= 0 || this.loading;
  }

  network(net: string): void {
    this.form.get('accountIssuer')?.setValue(net);
  }

  removeCart(id: string): void {
    this.$state.removeFromCart(id);
  }

  submit(): void {
    if (this.invalid) return;

    this.loading = true;
    const { name, phone, accountNumber, accountIssuer } = this.form.value;

    this.$service.onboard({ name, phone }).subscribe({
      next: ({ _id, token }) => {
        const payload = this.$state.state.payload;
        const cart = payload.cart.map((c) => ({
          giftcardId: c.giftcard,
          quantity: c.quantity,
          categoryId: c.categoryId,
        }));

        const order = {
          accountType: payload.accountType,
          recipient: _id,
          customerId: _id,
          accountNumber,
          accountIssuer,
          cart,
        };

        this.$service.order(order, token).subscribe({
          next: (res) => {
            this.form.reset();
            // Show success message and redirect
            this.router.navigate(['mobile']);
          },
          error: (err) => {
            this.loading = false;
            // Show error message
          },
          complete: () => {
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.loading = false;
        // Show error message
      },
    });
  }

  proceedToPayment() {
    this.paymentModalService.openModal();
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AppService } from '../services/app.service';
import { State } from '../state/app.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './mobile-payment.component.html',
  styleUrl: './mobile-payment.component.css',
})
export class MobilePaymentComponent {
  networks = ['vodafone', 'mtn', 'airteltigo'];

  paymentMethod: 'mobile' | 'bitcoin' = 'mobile';

  loading: boolean = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private $service: AppService,
    private $state: State,
    private router: Router
  ) {
    this.form = this.fb.group({
      accountIssuer: ['', Validators.required],
      accountNumber: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  // Method to set the payment method
  setPaymentMethod(method: 'mobile' | 'bitcoin'): void {
    this.paymentMethod = method;
  }

  get invalid(): boolean {
    return this.form.invalid;
  }


  submit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const { name, phone, accountNumber, accountIssuer } = this.form.value;
    this.$service.onboard({ name, phone }).subscribe({
      next: ({ _id, token }) => {
        const payload = this.$state.state.payload;
        const cart = payload.cart.map((c) => {
          return {
            giftcardId: c.giftcard,
            quantity: c.quantity,
            categoryId: c.categoryId,
          };
        });
        const order: any = {
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
            // Swal.fire({
            //   title: 'Order Completed',
            //   text: res.message,
            //   icon: 'success',
            // });
            this.router.navigate(['/mobile/transaction-success'], {
              queryParams: { method: 'mobile' }
            });
          },
          error: (err) => {
            this.loading = false;
            Swal.fire({
              title: 'Error',
              text: (err as Error)?.message,
              icon: 'error',
            });
          },
          complete: () => {
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
        });
      },
    });
  }

  network(net: string): void {
    this.form.get('accountIssuer')?.setValue(net);
  }
}

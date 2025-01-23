// transaction-success.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { AppService } from '../services/app.service';

interface TransactionDetails {
  externalTransactionId: string;
  transactionId: string;
  amount: string;
  currency: string;
  usdAmount: number;
  date: string;
  status: string;
}
@Component({
  selector: 'app-transaction-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'transaction-success.component.html',
  styles: [`
    @keyframes success-scale {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .animate-success {
      animation: success-scale 2s ease-in-out;
    }
  `]
})
export class TransactionSuccessComponent implements OnInit {
  paymentMethod: string = '';
  transactionDetails?: TransactionDetails;
  loading: boolean = true;
  error: string = '';
  private statusCheckSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private $service: AppService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.paymentMethod = params['method'] || 'mobile';
      
      // Capture all transaction details from URL params
      this.transactionDetails = {
        externalTransactionId: params['externalTransactionId'],
        transactionId: params['transactionId'],
        amount: params['amount'],
        currency: params['currency'],
        usdAmount: parseFloat(params['usdAmount']),
        date: params['date'],
        status: 'INITIATED'  // Initial status
      };
      
      if (this.paymentMethod === 'bitcoin' && this.transactionDetails?.externalTransactionId) {
        this.startStatusCheck();
      }
    });
  }

  startStatusCheck() {
    if (!this.transactionDetails?.externalTransactionId) return;

    // Initial check
    this.checkStatus();

    // Then check every 10 seconds
    this.statusCheckSubscription = interval(10000)
      .pipe(
        switchMap(() => {
          if (!this.transactionDetails?.externalTransactionId) {
            throw new Error('No transaction ID available');
          }
          return this.$service.verifyBitcoinPayment(this.transactionDetails.externalTransactionId);
        })
      )
      .subscribe({
        next: (response) => {
          if (this.transactionDetails) {
            this.transactionDetails.status = response.data.status;
          }
          this.loading = false;

          if (response.data.status === 'COMPLETED') {
            this.statusCheckSubscription?.unsubscribe();
          }
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
  }

  private checkStatus() {
    if (!this.transactionDetails?.externalTransactionId) return;

    this.$service.verifyBitcoinPayment(this.transactionDetails.externalTransactionId)
      .subscribe({
        next: (response) => {
          if (this.transactionDetails) {
            this.transactionDetails.status = response.data.status;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
  }

  goHome() {
    this.router.navigate(['/mobile']);
  }

  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-500';
      case 'INITIATED':
        return 'text-yellow-500';
      case 'PENDING':
        return 'text-yellow-500';
      case 'FAILED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  getStatusMessage(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Transaction completed successfully!';
      case 'INITIATED':
        return 'Transaction initiated, waiting for payment...';
      case 'PENDING':
        return 'Payment received, waiting for confirmation...';
      case 'FAILED':
        return 'Transaction failed. Please try again.';
      default:
        return 'Unknown status';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>`;
      case 'INITIATED':
      case 'PENDING':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
      case 'FAILED':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
    }
  }

  shouldShowCheckAgainButton(status: string): boolean {
    return ['INITIATED', 'PENDING'].includes(status.toUpperCase());
  }

  checkAgain() {
    if (this.transactionDetails?.externalTransactionId) {
      this.loading = true;
      this.checkStatus();
    }
  }

  // viewOrder() {
  //   // Navigate to order details (implement this route if needed)
  //   this.router.navigate(['/mobile/orders'], { 
  //     queryParams: { 
  //       id: this.transactionId 
  //     }
  //   });
  // }
}
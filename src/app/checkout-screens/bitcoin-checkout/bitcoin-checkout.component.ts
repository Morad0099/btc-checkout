import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../services/app.service';
import Swal from 'sweetalert2';

interface BitcoinPaymentData {
  transactionId: string;
  amount: string;
  address: string;
  qrCode: string;
  expirationTime: number;
  paymentLink: string;
  customerToken: string;
  currency: string;
  due: string;
  destination: string;
  rate: string;  
  date: string;
  usdAmount: number;
  externalTransactionId: string;
}

@Component({
  selector: 'app-bitcoin-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bitcoin-checkout.component.html',
})
export class BitcoinCheckoutComponent implements OnInit {
  loading: boolean = false;
  showCopied: boolean = false;
  paymentData?: BitcoinPaymentData;
  timeLeft: number = 0;
  showPaymentLinkCopied: boolean = false;
  private statusCheckInterval?: any;
  isChecking: boolean = false;

  infoIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;

  copyIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />`;

  spinnerIcon = `<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>`;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private $service: AppService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['transactionId']) {
        this.paymentData = {
          transactionId: params['transactionId'],
          amount: params['amount'],
          address: params['address'],
          qrCode: params['qrCode'],
          expirationTime: parseInt(params['expirationTime']),
          paymentLink: params['paymentLink'],
          customerToken: params['customerToken'],
          currency: params['currency'],
          due: params['due'],
          destination: params['destination'],
          rate: params['rate'],
          date: params['date'],
          usdAmount: parseFloat(params['usdAmount']),
          externalTransactionId: params['externalTransactionId']
        };
        
        this.startTimer();
      } else {
        // No valid payment data, redirect back
        this.router.navigate(['/cart']);
      }
    });
  }

  copyAddress() {
    if (this.paymentData?.address) {
      navigator.clipboard.writeText(this.paymentData.address);
      this.showCopied = true;
      setTimeout(() => (this.showCopied = false), 2000);
    }
  }

  copyPaymentLink() {
    if (this.paymentData?.paymentLink) {
      navigator.clipboard.writeText(this.paymentData.paymentLink);
      this.showPaymentLinkCopied = true;
      setTimeout(() => (this.showPaymentLinkCopied = false), 2000);
    }
  }

  startTimer() {
    if (!this.paymentData?.expirationTime) return;
    
    const now = Math.floor(Date.now() / 1000);
    this.timeLeft = this.paymentData.expirationTime - now;
    
    const timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(timer);
        this.handleTimeout();
      }
    }, 1000);
  }

  handleTimeout() {
    Swal.fire({
      title: 'Payment Time Expired',
      text: 'The payment session has expired. Please try again.',
      icon: 'error',
      confirmButtonText: 'Return to Cart'
    }).then(() => {
      this.router.navigate(['/cart']);
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  submit() {
    if (!this.paymentData?.externalTransactionId) return;
    
    this.loading = true;
    this.isChecking = true;
    this.startStatusPolling();
  }

  private startStatusPolling() {
    // Initial check
    this.checkTransactionStatus();

    // Poll every 5 seconds
    this.statusCheckInterval = setInterval(() => {
      this.checkTransactionStatus();
    }, 5000);
  }

  private checkTransactionStatus() {
    if (!this.paymentData?.externalTransactionId) return;

    this.$service.verifyBitcoinPayment(this.paymentData.externalTransactionId).subscribe({
      next: (response) => {
        if (response.success) {
          if (response.data.status === 'PAID') {
            this.handleSuccess();
          } else if (response.data.status === 'FAILED') {
            this.handleFailure('Transaction failed');
          }
          // Continue polling for other statuses
        } else {
          // Continue polling if not successful
          console.log('Transaction pending...');
        }
      },
      error: (error) => {
        this.handleFailure(error.message || 'Failed to verify payment');
      }
    });
  }

  private handleSuccess() {
    this.stopPolling();
    this.router.navigate(['transaction-success'], {
      queryParams: { 
        method: 'bitcoin',
        externalTransactionId: this.paymentData?.externalTransactionId,
        transactionId: this.paymentData?.transactionId,
        amount: this.paymentData?.amount,
        currency: this.paymentData?.currency,
        usdAmount: this.paymentData?.usdAmount,
        date: this.paymentData?.date
      }
    });
  }

  private handleFailure(message: string) {
    this.stopPolling();
    this.loading = false;
    this.isChecking = false;
      this.router.navigate(['transaction-cancelled']);
  }

  private stopPolling() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = undefined;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  cancel() {
    this.router.navigate(['transaction-cancelled']);
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BitcoinCheckoutComponent } from './checkout-screens/bitcoin-checkout/bitcoin-checkout.component';
import { MobileCartComponent } from './checkout-screens/mobile-cart/mobile-cart.component';
import { MobilePaymentComponent } from './checkout-screens/mobile-payment/mobile-payment.component';
import { TransactionCancelledComponent } from './checkout-screens/transaction-cancelled/transaction-cancelled.component';
import { TransactionSuccessComponent } from './checkout-screens/transaction-success/transaction-success.component';

const routes: Routes = [
  { path: '', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'checkout', component: BitcoinCheckoutComponent },
  { path: 'transaction-cancelledt', component: TransactionCancelledComponent },
  { path: 'transaction-success', component: TransactionSuccessComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

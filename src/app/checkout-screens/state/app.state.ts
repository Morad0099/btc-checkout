import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ICart {
  giftcard: string;
  quantity: number;
  currency: string;
  name?: string;
  amount?: number;
  categoryId?: string;
}

interface IState {
  loading: boolean;
  vouchers: Array<any>;
  categories: Array<any>;
  searchTerm: string;
  payload: {
    accountType: string | undefined;
    customerId: string | undefined;
    cart: Array<ICart>;
    amount: number | undefined;
    recipient: string | undefined;
  };
}

@Injectable({ providedIn: 'root' })
export class State {
  store = new BehaviorSubject<IState>({
    vouchers: [],
    categories: [],
    loading: false,
    searchTerm: '',
    payload: {
      accountType: 'MOMO',
      amount: undefined,
      cart: [],
      customerId: undefined,
      recipient: undefined,
    },
  });
  constructor() {}

  get state$(): Observable<IState> {
    return this.store;
  }

  get state(): IState {
    return this.store.value;
  }

  dispatch(data: Partial<IState>): void {
    const store = Object.assign(this.store.value, data);
    this.store.next(store);
  }

  removeFromCart(id: string): void {
    let { payload } = this.store.value;
    payload.cart = payload.cart.filter((c) => c.giftcard !== id);
    this.dispatch({ payload });
  }

  addToCart(voucher: any): void {
    let { payload } = this.store.value;
    let item = payload.cart.find((c) => c.giftcard === voucher._id);
    if (!item) {
      item = {
        name: voucher.description,
        currency: 'GHS',
        giftcard: voucher._id,
        quantity: 1,
        amount: Number(voucher.sellingPrice),
        categoryId: voucher.categoryId?._id,
      };
    } else {
      item.quantity += 1;
      item.amount! += Number(voucher.sellingPrice);
    }
    const filter = payload.cart.filter((c) => c.giftcard !== item?.giftcard);
    filter.push(item);
    payload.cart = filter;
    this.dispatch({ payload });
  }
}

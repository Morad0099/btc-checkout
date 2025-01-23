import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, take, tap, throwError } from 'rxjs';
import { baseurl } from '../ocnstants/api';
import { State } from '../state/app.state';

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private http: HttpClient, private $state: State) {}

  getCategoryImage(id: string): Observable<any> {
    return this.http.get(`${baseurl}/cards/category/image/${id}`).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => res.data?.data)
    );
  }

  getCategory(): void {
    this.$state.dispatch({ loading: true });
    this.http
      .get(`${baseurl}/cards/category/get`)
      .pipe(
        take(1),
        catchError((err) => of(err)),
        tap((res) => {
          if (!res.success) {
            throw Error(res.message);
          }
        }),
        map((res) => res.data),
        map((data: Array<any>) => {
          return data.map((d) => {
            return Object.assign(d, { image: this.getCategoryImage(d._id) });
          });
        })
      )
      .subscribe({
        next: (categories) => {
          this.$state.dispatch({ loading: false, categories });
        },
        error: () => {
          this.$state.dispatch({ loading: false });
        },
      });
  }

  getCards(id: string): void {
    this.$state.dispatch({ loading: true });
    this.http
      .get(`${baseurl}/cards/category/active/${id}`)
      .pipe(
        take(1),
        catchError((err) => of(err)),
        tap((res) => {
          if (!res.success) {
            throw Error(res.message);
          }
        }),
        map((res) => res.data)
      )
      .subscribe({
        next: (vouchers) => {
          this.$state.dispatch({ vouchers, loading: false });
        },
        error: () => {
          this.$state.dispatch({ loading: false });
        },
        complete: () => {
          this.$state.dispatch({ loading: false });
        },
      });
  }

  order(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${baseurl}/cards/purchase`, data, { headers });
  }

  calculatePrice(data: any): Observable<any> {
    return this.http.post(`${baseurl}/cards/calculate-bulk-price`, data).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => res.data)
    );
  }

  onboard(data: any): Observable<any> {
    return this.http.post(`${baseurl}/customers/onboard-token`, data).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => Object.assign({}, res.data, { token: res.token }))
    );
  }

  verifyBitcoinPayment(id: string): Observable<any> {
    return this.http.get(`${baseurl}/transactions/status/${id}`).pipe(
      take(1),
      catchError((err) => throwError(() => err)),  
      map((res: any) => {
        if (!res.success) {
          throw new Error(res.message);
        }
        return res;
      })
    );
  }
}

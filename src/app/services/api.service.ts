import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

// Types
import { Credentials, Product } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  credentialsSubject = new BehaviorSubject<Credentials | null>(null);

  constructor(private http: HttpClient) {}

  assignCredentials(credentialsForm: Credentials) {
    this.credentialsSubject.next({ ...credentialsForm });
  }

  fetchProducts(
    pageIndex: number,
    pageSize: number,
    searchItem: string | null
  ) {
    let params = new HttpParams({
      fromObject: {
        orderby: 'id',
        page: pageIndex,
        per_page: pageSize,
      },
    });

    if (searchItem !== null) {
      console.log('there is a string');
      params = params.set('search', searchItem);
    }

    return this.http
      .get<{ [key: string]: Product }>(
        `${this.credentialsSubject.value?.website}wp-json/wc/v3/products`,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization:
              'Basic ' +
              btoa(
                `${this.credentialsSubject.value?.userKey}:${this.credentialsSubject.value?.userSecretKey}`
              ),
          }),
          params,
        }
      )
      .pipe(
        map((response) => {
          const productsArray = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              const {
                id,
                name,
                date_created_gmt,
                featured,
                sku,
                price,
                sale_price,
                categories,
                tags,
                images,
                stock_status,
              } = response[key];

              productsArray.push({
                id,
                name,
                date_created_gmt,
                featured,
                sku,
                price,
                sale_price,
                categories,
                tags,
                images,
                stock_status,
              });
            }
          }
          return productsArray;
        })
      );
  }
}

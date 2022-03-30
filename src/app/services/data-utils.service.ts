import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataUtilsService {
  constructor() {}

  stockStatusStyle(status: string) {
    return status === 'instock' ? true : false;
  }

  formatPrice(price: string) {
    if (price.includes('.')) {
      return price.concat(' €');
    }
    return price.concat('.00 €');
  }

  formatDate(date: string) {
    return date.replace('T', ' ');
  }
}

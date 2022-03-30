import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataUtilsService } from 'src/app/services/data-utils.service';
import { ProductsDataSource } from 'src/app/services/products.datasource';

@Component({
  selector: 'app-table-products',
  templateUrl: './table-products.component.html',
  styleUrls: ['./table-products.component.css'],
})
export class TableProductsComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = [
    'image',
    'name',
    'sku',
    'inventory',
    'price',
    'categories',
    'tags',
    'featured',
    'date_created',
  ];
  dataSource!: ProductsDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('inputSearch') input!: ElementRef;

  constructor(private api: ApiService, public dataUtil: DataUtilsService) {}

  ngOnInit() {
    this.api.credentialsSubject.subscribe(() => this.getProducts());
    this.dataSource = new ProductsDataSource(this.api);
  }
  ngAfterViewInit() {
    this.paginator.page.pipe(tap(() => this.getProducts())).subscribe();

    // search
    fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        filter((e: KeyboardEvent | FocusEvent) => e instanceof FocusEvent || e.key === 'Enter'),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.getProducts();
        })
      )
      .subscribe();
  }

  getProducts() {
    if (this.api.credentialsSubject.value === null) return;

    this.dataSource.loadProducts(
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.input.nativeElement.value
    );
  }
}

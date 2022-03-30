import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  hide: boolean = true;
  constructor(private api: ApiService) {}

  onSubmit(form: NgForm) {
    this.api.assignCredentials(form.value);
  }
}

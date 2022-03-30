import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginCredentials, User } from 'src/app/interfaces/user';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isLoading = false;
  hide = true;
  error: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {}
  onClick() {
    this.router.navigateByUrl('/signup');
  }
  onSubmit(form: NgForm) {
    if (!form.valid) return;

    const { email, password } = form.value;

    this.authService.login(email, password).subscribe({
      error: (e) => {
        this.isLoading = false;
        this.error = e;
        console.log(e);
      },
      next: (res) => {
        this.isLoading = false;
        console.log('Login successfull', res);
        this.router.navigate(['dashboard']);
      },
    });
  }
}

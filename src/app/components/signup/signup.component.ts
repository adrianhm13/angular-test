import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  hide = true;
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {}

  onClick() {
    this.router.navigateByUrl('/login');
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;
    const { username, email, password } = form.value;

    this.isLoading = true;

    this.authService.signup(email, password).subscribe({
      error: (e) => {
        this.isLoading = false;
        this.error = e;
        console.log(e);
      },
      next: (res) => {
        // Updating display name for the registered user
        this.authService.updateName(res.idToken, username).subscribe({
          next: (res) => {
            this.isLoading = false;
            console.log(res);
            this.router.navigate(['/dashboard']);
          },
          error: (e) => {
            this.isLoading = false;
            this.error = e;
            console.log(e);
          },
        });
      },
    });
  }
}

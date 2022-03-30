import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { User } from '../pages/auth/user.model';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  displayName: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<User | null>(null);
  private tokenExpirationTime!: ReturnType<typeof setTimeout> | null;

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDx0S7ckEVqFKyrpDQiTH3py8kYloSlh0A',
        {
          email,
          password,
          returnSecureToken: true,
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateName(idToken: string, displayName: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyDx0S7ckEVqFKyrpDQiTH3py8kYloSlh0A',
        {
          idToken,
          displayName,
          returnSecureToken: false,
        }
      )
      .pipe(
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.displayName,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDx0S7ckEVqFKyrpDQiTH3py8kYloSlh0A',
        {
          email,
          password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.displayName,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  // Use of localStorage in this particular case,
  // Angular protects the app from XSS attacks by default
  persistentLogin() {
    const userData: {
      email: string;
      id: string;
      displayName: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData')!);

    if (!userData) return;

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData.displayName,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    // If token still valid, assign the user
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()

      this.logoutAfterTokenExpired(expirationDuration)
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/']);
    localStorage.removeItem('userData');

    // Clearing Timeout manually if the user logouts
    if (this.tokenExpirationTime) {
      clearTimeout(this.tokenExpirationTime);
    }

    this.tokenExpirationTime = null;
  }

  logoutAfterTokenExpired(expirationDuration: number) {
    this.tokenExpirationTime = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    displayName: string,
    token: string,
    expiresIn: number
  ) {
    // Token's expiration it's one hour from login/register
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, displayName, token, expirationDate);
    this.user.next(user);

    this.logoutAfterTokenExpired(expiresIn * 1000)
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorResponse: HttpErrorResponse) {
    let errorMessage: string = 'An unknown error occurred';

    // Handling conexion problems
    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(() => new Error(errorMessage));
    }

    // Errors from firebase auth
    switch (errorResponse.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists!';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage = 'Too many attempts. Try again later';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'There is no user with that email';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Invalid password';
        break;
      case 'USER_DISABLED':
        errorMessage = 'The user account has been disabled';
    }
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, take, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SigninGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.user.pipe(
      take(1),
      map((user) => {
        // If user logged in, signin/signup routes will redirect to dashboard
        const isAuth = !!user;
        if (isAuth) {
          return this.router.createUrlTree(['/dashboard']);
        }
        return true;
      })
    );
  }
}

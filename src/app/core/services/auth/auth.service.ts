import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuthResponse,
  FirstPasswordChangedRequest,
  LoginRequest,
  MfaVerifyRequest,
  RefreshRequest,
} from '../../models/auth.model';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL: string = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  public login(credentials: LoginRequest, rememberMe: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        if (!response.mfaRequired && response.status === 'SUCCESS') {
          this.setSession(response, rememberMe);
        }
      }),
    );
  }

  public logout(): void {
    const request: RefreshRequest = {
      refreshToken:
        localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token'),
    };
    this.http.post<AuthResponse>(`${this.API_URL}/logout`, request).pipe();

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  public refreshToken(): Observable<AuthResponse> {
    const refreshRequest: RefreshRequest = {
      refreshToken:
        localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token'),
    };
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, refreshRequest).pipe(
      tap((response) => {
        const isLocal = !!localStorage.getItem('refresh_token');
        this.setSession(response, isLocal);
      }),
    );
  }

  public firstPasswordReset(credentials: FirstPasswordChangedRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/first-password`, credentials).pipe(
      tap((response) => {
        if (!response.mfaRequired && response.status === 'SUCCESS') {
          this.setSession(response, false);
        }
      }),
    );
  }

  public getToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getUserRole(): string {
    const token = this.getToken();
    if (!token) throw new Error('Token is required');
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || decoded.authorities;
    } catch {
      throw new Error('Unable to get user role');
    }
  }

  public getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub;
    } catch {
      return null;
    }
  }

  public verifyMfaAndLogin(request: MfaVerifyRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/mfa/verify`, request);
  }

  public setSession(authResult: AuthResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    (rememberMe ? sessionStorage : localStorage).clear();
    storage.setItem('access_token', authResult.accessToken);
    storage.setItem('refresh_token', authResult.refreshToken);
  }
}

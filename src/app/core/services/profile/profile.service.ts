import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  AdminUserSummaryResponse,
  ChangeEmailRequest,
  ChangePasswordRequest,
  DisableMfaRequest,
  MfaConfirmRequest,
  MfaSetupResponse,
  ProfileResponse,
  SecurityProfile,
  UpdateProfileRequest,
} from '../../models/profile.model';
import { Observable } from 'rxjs';
import { HealthIndicator } from '../../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly API_URL = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  public me(): Observable<AdminUserSummaryResponse> {
    return this.http.get<AdminUserSummaryResponse>(`${this.API_URL}/me`);
  }

  findProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.API_URL}`);
  }

  findSecurityProfile(): Observable<SecurityProfile> {
    return this.http.get<SecurityProfile>(`${this.API_URL}/security`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(`${this.API_URL}`, request);
  }

  changeEmail(request: ChangeEmailRequest): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(`${this.API_URL}/email`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(`${this.API_URL}/security/password`, request);
  }

  setupMfa(): Observable<MfaSetupResponse> {
    return this.http.post<MfaSetupResponse>(`${this.API_URL}/security/mfa/setup`, {});
  }

  verifyMfa(request: MfaConfirmRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/security/mfa/confirm`, request);
  }

  disableMfa(request: DisableMfaRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/security/mfa/disable`, request);
  }
}

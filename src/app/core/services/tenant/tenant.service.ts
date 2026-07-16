import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantBrandingResponse } from '../../models/tenant.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private readonly API_URL: string = `${environment.apiUrl}/tenant`;

  constructor(private http: HttpClient) { }

  getMyBranding(): Observable<TenantBrandingResponse> {
    return this.http.get<TenantBrandingResponse>(`${this.API_URL}/me/branding`);
  }
}

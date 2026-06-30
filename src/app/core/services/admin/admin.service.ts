import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminUserSummaryResponse } from '../../models/profile.model';
import { HealthIndicator } from '../../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL: string = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  public healthCheck(): Observable<HealthIndicator> {
    return this.http.get<HealthIndicator>(`${this.API_URL}/actuator/health`);
  }
}

import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUser, PaginatedUsers, UserDetail, UserSummary } from '../../models/user.model';
import { ProfileResponse } from '../../models/profile.model';

interface TenantUserState {
  users: UserSummary[];
  totalElements: number;
  loading: boolean;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly API_URL: string = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  findAll(
    page: number = 0,
    size: number = 10,
    sort: string = 'name,asc',
  ): Observable<PaginatedUsers> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PaginatedUsers>(this.API_URL, { params });
  }

  findById(userId: string): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.API_URL}/${userId}`);
  }

  create(request: CreateUser): Observable<UserDetail> {
    return this.http.post<UserDetail>(this.API_URL, request);
  }

  update(userId: string, updateData: Partial<UserDetail>): Observable<UserDetail> {
    return this.http.patch<UserDetail>(`${this.API_URL}/${userId}`, updateData);
  }

  toggleStatus(userId: string): Observable<UserDetail> {
    return this.http.patch<UserDetail>(`${this.API_URL}/${userId}/toggle-status`, null);
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`);
  }
}

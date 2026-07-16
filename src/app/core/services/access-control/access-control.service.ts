import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccessControlService {
  private accessDeniedSource = new Subject<void>();

  public accessDenied$ = this.accessDeniedSource.asObservable();

  public notifyAccessDenied(): void {
    this.accessDeniedSource.next();
  }
}

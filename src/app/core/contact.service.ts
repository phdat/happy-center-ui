import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContactRequest, ContactResponse } from './contact.model';

/** Where the contact form posts to. Defaults to `environment.contactEndpoint`. */
export const CONTACT_ENDPOINT = new InjectionToken<string>('CONTACT_ENDPOINT', {
  providedIn: 'root',
  factory: () => environment.contactEndpoint,
});

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(CONTACT_ENDPOINT);

  create(request: ContactRequest): Observable<ContactResponse> {
    if (!this.endpoint) {
      return throwError(() => new Error('Contact endpoint is not configured (environment.ts).'));
    }
    // Apps Script web apps can't answer CORS preflight requests, so we send a "simple"
    // request: JSON as text/plain. The script parses it with JSON.parse.
    return this.http
      .post<ContactResponse>(this.endpoint, JSON.stringify(request), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      })
      .pipe(
        map((res) => {
          if (!res?.ok) throw new Error(res?.error ?? 'Contact request was rejected.');
          return res;
        }),
      );
  }
}

import { CourseId } from './course.model';

export type ContactAudience = 'SELF' | 'CHILD';

/** Payload sent to the contact endpoint (Google Apps Script, see apps-script/Code.gs). */
export interface ContactRequest {
  audience: ContactAudience;
  fullName: string;
  phone: string;
  email: string | null;
  courses: CourseId[];
  note: string | null;
  /** Honeypot: hidden from people, bots fill it in. Must stay empty. */
  website: string;
}

export interface ContactResponse {
  ok: boolean;
  id?: string;
  error?: string;
}

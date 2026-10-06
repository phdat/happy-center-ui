import { CourseId } from './course.model';

export type ContactAudience = 'SELF' | 'CHILD';

/** Payload for POST /api/contacts. */
export interface ContactRequest {
  audience: ContactAudience;
  fullName: string;
  phone: string;
  email: string | null;
  courses: CourseId[];
  note: string | null;
}

export interface ContactResponse {
  id: number;
  createdAt: string;
}

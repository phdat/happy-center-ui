import { Injectable, signal } from '@angular/core';
import { CourseId } from './course.model';

export interface CourseRequest {
  courseId: CourseId;
  /** Increments on every request so clicking the same course twice still notifies. */
  seq: number;
}

/**
 * Lets a course card ask the contact form to pre-select a course
 * ("Tư vấn khóa này") without the two components knowing each other.
 */
@Injectable({ providedIn: 'root' })
export class EnrollmentIntentService {
  private seq = 0;
  private readonly _requested = signal<CourseRequest | null>(null);
  readonly requested = this._requested.asReadonly();

  requestCourse(courseId: CourseId): void {
    this._requested.set({ courseId, seq: ++this.seq });
  }
}

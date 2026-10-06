import { Component, inject } from '@angular/core';
import { COURSES, CourseId, CourseTrack, TRACK_LABELS } from '../../core/course.model';
import { EnrollmentIntentService } from '../../core/enrollment-intent.service';
import { CourseCard } from '../course-card/course-card';

@Component({
  selector: 'app-course-catalog',
  imports: [CourseCard],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.css',
})
export class CourseCatalog {
  private readonly intent = inject(EnrollmentIntentService);

  protected readonly tracks = (['english', 'computer'] as CourseTrack[]).map((track) => ({
    track,
    label: TRACK_LABELS[track],
    courses: COURSES.filter((c) => c.track === track),
  }));

  protected onConsult(id: CourseId): void {
    this.intent.requestCourse(id);
  }
}

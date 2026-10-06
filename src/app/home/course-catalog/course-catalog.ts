import { Component, inject } from '@angular/core';
import { CourseId } from '../../core/course.model';
import { CourseStore } from '../../core/course.store';
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
  protected readonly store = inject(CourseStore);

  protected onConsult(id: CourseId): void {
    this.intent.requestCourse(id);
  }
}

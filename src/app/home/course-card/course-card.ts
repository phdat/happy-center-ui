import { Component, input, output } from '@angular/core';
import { Course, CourseId } from '../../core/course.model';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
  host: {
    '[class.computer]': "variant() === 'blue'",
  },
})
export class CourseCard {
  readonly course = input.required<Course>();
  /** Card colour, alternates per course group. */
  readonly variant = input<'sun' | 'blue'>('sun');
  readonly consult = output<CourseId>();
}

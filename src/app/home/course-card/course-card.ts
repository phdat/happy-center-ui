import { Component, input, output } from '@angular/core';
import { Course, CourseId } from '../../core/course.model';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
  host: {
    '[class.english]': "course().track === 'english'",
    '[class.computer]': "course().track === 'computer'",
  },
})
export class CourseCard {
  readonly course = input.required<Course>();
  readonly consult = output<CourseId>();
}

import { Component } from '@angular/core';

/**
 * Grey placeholder with the same shape as a course card (tag, title, description,
 * highlights, info, button), shown while the course list loads from the sheet.
 */
@Component({
  selector: 'app-course-card-skeleton',
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="card">
      <span class="bone bone-pill" style="width: 96px; height: 24px"></span>
      <span class="bone" style="width: 72%; height: 30px; margin-top: 4px"></span>
      <div class="lines">
        <span class="bone" style="width: 100%; height: 14px"></span>
        <span class="bone" style="width: 82%; height: 14px"></span>
      </div>
      <div class="lines">
        @for (w of bullets; track $index) {
          <div class="bullet">
            <span class="bone bone-pill" style="width: 18px; height: 18px"></span>
            <span class="bone" [style.width]="w" style="height: 14px"></span>
          </div>
        }
      </div>
      <div class="meta">
        <span class="bone" style="width: 55%; height: 14px"></span>
        <span class="bone" style="width: 42%; height: 14px"></span>
      </div>
      <span class="bone bone-pill" style="width: 100%; height: 48px"></span>
    </div>
  `,
  styles: `
    :host {
      display: flex;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      padding: 28px;
      border: 2px solid var(--line);
      border-radius: 22px;
      background: var(--surface);
    }
    .lines {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .bullet {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .meta {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 2px dashed var(--line);
    }
  `,
})
export class CourseCardSkeleton {
  protected readonly bullets = ['78%', '64%', '70%'];
}

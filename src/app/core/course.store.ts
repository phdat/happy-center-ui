import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, of, timeout } from 'rxjs';
import { CONTACT_ENDPOINT } from './contact.service';
import { Course, CourseId, FALLBACK_COURSES } from './course.model';

export type CourseLoadState = 'loading' | 'sheet' | 'fallback';

export interface CourseGroup {
  name: string;
  /** Alternates the card colour per group: 0 = yellow, 1 = blue. */
  variant: 'sun' | 'blue';
  courses: Course[];
}

const LOAD_TIMEOUT_MS = 8000;

/**
 * Course list, loaded once from the "Khóa học" tab of the Google Sheet through the
 * Apps Script web app (`GET <exec URL>?action=courses`). Falls back to FALLBACK_COURSES
 * when the sheet can't be reached, so the page is never empty.
 */
@Injectable({ providedIn: 'root' })
export class CourseStore {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(CONTACT_ENDPOINT);

  private readonly _courses = signal<readonly Course[]>([]);
  private readonly _state = signal<CourseLoadState>('loading');

  readonly courses = this._courses.asReadonly();
  readonly state = this._state.asReadonly();

  /** Courses grouped by their "Nhóm", in the order the groups first appear in the sheet. */
  readonly groups = computed<CourseGroup[]>(() => {
    const groups: CourseGroup[] = [];
    for (const course of this._courses()) {
      let g = groups.find((x) => x.name === course.group);
      if (!g) {
        g = { name: course.group, variant: groups.length % 2 === 0 ? 'sun' : 'blue', courses: [] };
        groups.push(g);
      }
      g.courses.push(course);
    }
    return groups;
  });

  constructor() {
    this.load();
  }

  find(id: CourseId): Course | undefined {
    return this._courses().find((c) => c.id === id);
  }

  load(): void {
    if (!this.endpoint) {
      this.useFallback();
      return;
    }
    this._state.set('loading');
    this.http
      .get<unknown>(this.endpoint, { params: new HttpParams().set('action', 'courses') })
      .pipe(
        timeout(LOAD_TIMEOUT_MS),
        map((res) => parseCourses(res)),
        catchError((err) => {
          console.warn('Could not load courses from the sheet, using built-in list.', err);
          return of(null);
        }),
      )
      .subscribe((courses) => {
        if (courses && courses.length) {
          this._courses.set(courses);
          this._state.set('sheet');
        } else {
          this.useFallback();
        }
      });
  }

  private useFallback(): void {
    this._courses.set(FALLBACK_COURSES);
    this._state.set('fallback');
  }
}

/** Validates the Apps Script response; drops malformed rows instead of breaking the page. */
export function parseCourses(res: unknown): Course[] | null {
  if (!res || typeof res !== 'object' || (res as { ok?: unknown }).ok !== true) return null;
  const list = (res as { courses?: unknown }).courses;
  if (!Array.isArray(list)) return null;

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const strList = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

  const seen = new Set<string>();
  const courses: Course[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const id = str(r['id']);
    const title = str(r['title']);
    if (!id || !title || seen.has(id)) continue;
    seen.add(id);
    courses.push({
      id,
      group: str(r['group']) || 'Khóa học',
      shortName: str(r['shortName']) || title,
      title,
      tag: str(r['tag']),
      description: str(r['description']),
      highlights: strList(r['highlights']),
      meta: Array.isArray(r['meta'])
        ? r['meta']
            .map((m) => ({ label: str((m as CourseMetaLike)?.label), value: str((m as CourseMetaLike)?.value) }))
            .filter((m) => m.label && m.value)
        : [],
    });
  }
  return courses;
}

interface CourseMetaLike {
  label?: unknown;
  value?: unknown;
}

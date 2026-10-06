import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CONTACT_ENDPOINT } from './contact.service';
import { FALLBACK_COURSES } from './course.model';
import { CourseStore, parseCourses } from './course.store';

const ENDPOINT = 'https://script.example.test/exec';

function setup(endpoint = ENDPOINT) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: CONTACT_ENDPOINT, useValue: endpoint },
    ],
  });
  return { store: TestBed.inject(CourseStore), http: TestBed.inject(HttpTestingController) };
}

describe('CourseStore', () => {
  it('loads courses from the sheet and groups them in sheet order', () => {
    const { store, http } = setup();
    expect(store.state()).toBe('loading');

    const req = http.expectOne((r) => r.url === ENDPOINT && r.params.get('action') === 'courses');
    req.flush({
      ok: true,
      courses: [
        { id: 'IELTS', group: 'Luyện thi', title: 'Luyện thi IELTS', highlights: ['A'], meta: [{ label: 'Học phí', value: '3tr' }] },
        { id: 'KIDS', group: 'Tiếng Anh', title: 'Tiếng Anh cho bé' },
        { id: 'TOEIC', group: 'Luyện thi', title: 'TOEIC' },
      ],
    });

    expect(store.state()).toBe('sheet');
    expect(store.groups().map((g) => [g.name, g.variant, g.courses.map((c) => c.id)])).toEqual([
      ['Luyện thi', 'sun', ['IELTS', 'TOEIC']],
      ['Tiếng Anh', 'blue', ['KIDS']],
    ]);
    expect(store.find('IELTS')?.shortName).toBe('Luyện thi IELTS');
    http.verify();
  });

  it('falls back to the built-in list when the request fails', () => {
    const { store, http } = setup();
    http.expectOne(() => true).flush(null, { status: 500, statusText: 'Error' });
    expect(store.state()).toBe('fallback');
    expect(store.courses()).toEqual(FALLBACK_COURSES);
  });

  it('falls back when the sheet has no visible courses', () => {
    const { store, http } = setup();
    http.expectOne(() => true).flush({ ok: true, courses: [] });
    expect(store.state()).toBe('fallback');
  });

  it('uses the built-in list without any request when no endpoint is configured', () => {
    const { store, http } = setup('');
    expect(store.state()).toBe('fallback');
    http.expectNone(() => true);
  });
});

describe('parseCourses', () => {
  it('drops malformed and duplicate rows', () => {
    expect(
      parseCourses({
        ok: true,
        courses: [
          { id: 'A', title: 'Course A', meta: [{ label: 'x' }, { label: 'Giá', value: '1' }], highlights: ['', 'h'] },
          { id: 'A', title: 'Duplicate' },
          { id: '', title: 'No id' },
          { id: 'B' },
          'junk',
        ],
      }),
    ).toEqual([
      {
        id: 'A',
        group: 'Khóa học',
        shortName: 'Course A',
        title: 'Course A',
        tag: '',
        description: '',
        highlights: ['h'],
        meta: [{ label: 'Giá', value: '1' }],
      },
    ]);
  });

  it('rejects error responses', () => {
    expect(parseCourses({ ok: false, error: 'x' })).toBeNull();
    expect(parseCourses(null)).toBeNull();
  });
});

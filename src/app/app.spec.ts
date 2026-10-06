import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { CONTACT_ENDPOINT } from './core/contact.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // No endpoint → CourseStore uses the built-in course list, no network in tests.
      providers: [provideHttpClient(), { provide: CONTACT_ENDPOINT, useValue: '' }],
    }).compileComponents();
  });

  it('renders all home sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Học vui mỗi ngày');
    expect(el.querySelectorAll('app-course-card').length).toBe(5);
    expect(el.querySelector('#steps')).toBeTruthy();
    expect(el.querySelector('#contact form')).toBeTruthy();
  });

  it('pre-selects a course in the form when "Tư vấn khóa này" is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const toeicCard = Array.from(el.querySelectorAll('app-course-card')).find((c) =>
      c.textContent?.includes('Luyện thi TOEIC'),
    )!;
    toeicCard.querySelector<HTMLAnchorElement>('a.btn')!.click();
    await fixture.whenStable();

    const pressed = Array.from(el.querySelectorAll('.chip[aria-pressed="true"]')).map((b) =>
      b.textContent?.trim(),
    );
    expect(pressed).toEqual(['TOEIC']);
  });
});

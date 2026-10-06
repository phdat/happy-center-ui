import { Component, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormField, FormRoot, email, form, maxLength, pattern, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ContactAudience, ContactRequest } from '../../core/contact.model';
import { ContactService } from '../../core/contact.service';
import { CourseId } from '../../core/course.model';
import { CourseStore } from '../../core/course.store';
import { EnrollmentIntentService } from '../../core/enrollment-intent.service';

interface ContactFormModel {
  audience: ContactAudience;
  fullName: string;
  phone: string;
  email: string;
  courses: CourseId[];
  note: string;
  /** Honeypot, see contact.model.ts */
  website: string;
}

interface SubmittedInfo {
  name: string;
  phone: string;
  courses: string;
}

/** Vietnamese mobile/landline: 0xxxxxxxxx or +84xxxxxxxxx, spaces / dots / dashes allowed. */
export const VN_PHONE = /^(?:\+84|0)(?:[\s.-]?\d){9}$/;

const EMPTY_MODEL: ContactFormModel = {
  audience: 'SELF',
  fullName: '',
  phone: '',
  email: '',
  courses: [],
  note: '',
  website: '',
};

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s.-]/g, '');
}

export function toContactRequest(m: ContactFormModel): ContactRequest {
  return {
    audience: m.audience,
    fullName: m.fullName.trim(),
    phone: normalizePhone(m.phone),
    email: m.email.trim() || null,
    courses: [...m.courses],
    note: m.note.trim() || null,
    website: m.website,
  };
}

@Component({
  selector: 'app-contact-form',
  imports: [FormRoot, FormField],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  private readonly contactService = inject(ContactService);
  private readonly intent = inject(EnrollmentIntentService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly courseStore = inject(CourseStore);

  protected readonly courses = this.courseStore.courses;
  protected readonly coursesLoading = computed(() => this.courseStore.state() === 'loading');
  protected readonly submitted = signal<SubmittedInfo | null>(null);
  protected readonly serverError = signal<string | null>(null);

  protected readonly model = signal<ContactFormModel>({ ...EMPTY_MODEL });

  protected readonly contactForm = form(
    this.model,
    (p) => {
      required(p.fullName, { message: 'Vui lòng nhập họ tên.' });
      maxLength(p.fullName, 100, { message: 'Họ tên tối đa 100 ký tự.' });
      required(p.phone, { message: 'Vui lòng nhập số điện thoại.' });
      pattern(p.phone, VN_PHONE, {
        message: 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).',
      });
      email(p.email, { message: 'Email chưa đúng định dạng.' });
      maxLength(p.note, 1000, { message: 'Ghi chú tối đa 1000 ký tự.' });
    },
    {
      submission: {
        action: async () => {
          await this.send();
          return undefined;
        },
        onInvalid: () => this.focusFirstInvalid(),
      },
    },
  );

  constructor() {
    // A course card asked to consult a specific course → tick it in the form.
    effect(() => {
      const req = this.intent.requested();
      if (!req) return;
      untracked(() => {
        this.submitted.set(null);
        this.model.update((m) =>
          m.courses.includes(req.courseId) ? m : { ...m, courses: [...m.courses, req.courseId] },
        );
      });
    });
  }

  protected setAudience(audience: ContactAudience): void {
    this.model.update((m) => ({ ...m, audience }));
  }

  protected isSelected(id: CourseId): boolean {
    return this.model().courses.includes(id);
  }

  protected toggleCourse(id: CourseId): void {
    this.model.update((m) => ({
      ...m,
      courses: m.courses.includes(id) ? m.courses.filter((c) => c !== id) : [...m.courses, id],
    }));
  }

  protected reset(): void {
    this.model.set({ ...EMPTY_MODEL });
    this.contactForm().reset();
    this.submitted.set(null);
    this.serverError.set(null);
  }

  private async send(): Promise<void> {
    this.serverError.set(null);
    const request = toContactRequest(this.model());
    try {
      await firstValueFrom(this.contactService.create(request));
      const names = request.courses.map((id) => this.courseStore.find(id)?.shortName ?? id);
      this.submitted.set({
        name: request.fullName.split(/\s+/).pop() ?? request.fullName,
        phone: request.phone,
        courses: names.length ? `khóa ${names.join(', ')}` : 'khóa học phù hợp nhất',
      });
    } catch (err) {
      console.error('Contact submit failed', err);
      this.serverError.set('Chưa gửi được thông tin. Vui lòng thử lại hoặc gọi hotline của trung tâm.');
    }
  }

  private focusFirstInvalid(): void {
    queueMicrotask(() =>
      this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );
  }
}

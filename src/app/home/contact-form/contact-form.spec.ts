import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactForm, VN_PHONE, toContactRequest } from './contact-form';

describe('ContactForm', () => {
  let fixture: ComponentFixture<ContactForm>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const type = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () =>
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactForm);
    el = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('shows validation errors and sends nothing when required fields are empty', async () => {
    submit();
    await fixture.whenStable();

    const errors = Array.from(el.querySelectorAll('.error')).map((e) => e.textContent?.trim());
    expect(errors).toContain('Vui lòng nhập họ tên.');
    expect(errors).toContain('Vui lòng nhập số điện thoại.');
    http.expectNone('/api/contacts');
  });

  it('rejects an invalid phone number', async () => {
    type('#f-name', 'Nguyễn Văn An');
    type('#f-phone', '12345');
    submit();
    await fixture.whenStable();
    expect(el.querySelector('#f-phone-err')?.textContent).toContain('Số điện thoại chưa đúng');
    http.expectNone('/api/contacts');
  });

  it('posts the normalized request and shows the thank-you message', async () => {
    type('#f-name', '  Nguyễn Văn An ');
    type('#f-phone', '0912 345 678');
    el.querySelectorAll<HTMLButtonElement>('.chip')[1].click(); // TOEIC
    el.querySelectorAll<HTMLInputElement>('input[name="audience"]')[1].click(); // Con của tôi
    await fixture.whenStable();
    submit();

    const req = http.expectOne('/api/contacts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      audience: 'CHILD',
      fullName: 'Nguyễn Văn An',
      phone: '0912345678',
      email: null,
      courses: ['TOEIC'],
      note: null,
    });
    req.flush({ id: 1, createdAt: '2026-10-01T10:00:00Z' }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    const success = el.querySelector('[role="status"]')!;
    expect(success.textContent).toContain('Cảm ơn An!');
    expect(success.textContent).toContain('0912345678');
    expect(success.textContent).toContain('khóa TOEIC');
  });

  it('shows an error message when the server fails', async () => {
    type('#f-name', 'Lan');
    type('#f-phone', '0912345678');
    submit();
    http.expectOne('/api/contacts').flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(el.querySelector('.server-error')?.textContent).toContain('Chưa gửi được thông tin');
  });
});

describe('VN_PHONE / toContactRequest', () => {
  it('accepts common Vietnamese formats', () => {
    for (const ok of ['0912345678', '0912 345 678', '091.234.5678', '+84912345678']) {
      expect(VN_PHONE.test(ok)).toBe(true);
    }
    for (const bad of ['091234567', '09123456789', '1912345678', 'abc']) {
      expect(VN_PHONE.test(bad)).toBe(false);
    }
  });

  it('trims and nulls optional fields', () => {
    expect(
      toContactRequest({
        audience: 'SELF',
        fullName: ' A ',
        phone: '091-234-5678',
        email: '  ',
        courses: [],
        note: '',
      }),
    ).toEqual({ audience: 'SELF', fullName: 'A', phone: '0912345678', email: null, courses: [], note: null });
  });
});

import { Component } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  template: `
    <section id="steps" class="band" aria-labelledby="steps-title">
      <div class="container inner">
        <h2 id="steps-title" class="section-title">Bắt đầu chỉ với 3 bước</h2>
        <ol class="steps">
          @for (step of steps; track step.title; let i = $index) {
            <li>
              <span class="num" aria-hidden="true">{{ i + 1 }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    .band {
      background: var(--ink);
      color: #fff;
    }
    .inner {
      display: flex;
      flex-direction: column;
      gap: 48px;
      padding-block: 88px;
    }
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
      gap: 32px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--sun);
      color: var(--ink);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 30px;
    }
    h3 {
      font-size: 22px;
      font-weight: 700;
    }
    p {
      color: var(--muted-on-dark);
    }
    @media (max-width: 600px) {
      .inner {
        padding-block: 56px;
      }
    }
  `,
})
export class HowItWorks {
  protected readonly steps = [
    { title: 'Để lại thông tin', text: 'Điền form bên dưới — chỉ mất chưa đến một phút.' },
    {
      title: 'Happy gọi lại tư vấn',
      text: 'Tư vấn viên tìm hiểu mục tiêu và trình độ hiện tại của bạn hoặc của bé.',
    },
    { title: 'Vào lớp phù hợp', text: 'Chọn lịch học và lớp đúng trình độ, bắt đầu học ngay.' },
  ];
}

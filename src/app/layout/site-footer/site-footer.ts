import { Component } from '@angular/core';
import { LogoMark } from '../../shared/logo/logo';

@Component({
  selector: 'app-site-footer',
  imports: [LogoMark],
  template: `
    <footer class="footer">
      <div class="container inner">
        <div class="brand">
          <app-logo-mark [size]="40" [inverse]="true" />
          <span class="brand-text">
            <strong>HẠNH PHÚC</strong>
            <span>Trung tâm Anh ngữ &amp; Tin học</span>
          </span>
        </div>
        <nav aria-label="Liên kết cuối trang" class="links">
          <a href="#courses">Khóa học</a>
          <a href="#contact">Liên hệ</a>
          <!-- TODO: thay bằng link Facebook / Zalo OA thật -->
          <a href="#top">[Facebook / Zalo OA]</a>
        </nav>
        <span class="copy">© {{ year }} HẠNH PHÚC. [ĐỊA CHỈ TRUNG TÂM]</span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--ink-deep);
      color: var(--muted-on-dark);
    }
    .inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding-block: 48px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
      font-size: 14px;
    }
    .brand-text strong {
      color: #fff;
      font-family: var(--font-display);
      font-size: 22px;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      font-size: 15px;
    }
    .links a:hover {
      color: #fff;
    }
    .copy {
      font-size: 14px;
    }
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}

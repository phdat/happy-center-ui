import { Component, signal } from '@angular/core';
import { LogoMark } from '../../shared/logo/logo';

@Component({
  selector: 'app-site-header',
  imports: [LogoMark],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class SiteHeader {
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { href: '#courses', label: 'Khóa học' },
    { href: '#steps', label: 'Cách đăng ký' },
    { href: '#contact', label: 'Liên hệ' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

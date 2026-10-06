import { Component, input } from '@angular/core';

/** Happy smiley mark. `inverse` = yellow tile with ink face (for dark backgrounds). */
@Component({
  selector: 'app-logo-mark',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 44 44" aria-hidden="true">
      <rect x="1" y="1" width="42" height="42" rx="13" [attr.fill]="inverse() ? sun : ink" />
      <circle cx="15" cy="17" r="3" [attr.fill]="inverse() ? ink : sun" />
      <circle cx="29" cy="17" r="3" [attr.fill]="inverse() ? ink : sun" />
      <path
        d="M12 25c3 6 17 6 20 0"
        [attr.stroke]="inverse() ? ink : sun"
        stroke-width="3.5"
        fill="none"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class LogoMark {
  readonly size = input(44);
  readonly inverse = input(false);
  protected readonly ink = '#1a2238';
  protected readonly sun = '#ffc531';
}

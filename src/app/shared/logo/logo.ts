import { Component, input } from '@angular/core';

/** HP emblem (laptop + open book). `inverse` = on a white tile, for dark backgrounds. */
@Component({
  selector: 'app-logo-mark',
  template: `<img src="logo-mark.png" alt="" [style.height.px]="size()" />`,
  host: { '[class.inverse]': 'inverse()' },
  styles: `
    :host {
      display: inline-flex;
    }
    :host(.inverse) {
      padding: 6px 8px;
      border-radius: 12px;
      background: #fff;
    }
    img {
      display: block;
      width: auto;
    }
  `,
})
export class LogoMark {
  /** Height in px; the emblem is about 1.4× as wide. */
  readonly size = input(44);
  readonly inverse = input(false);
}

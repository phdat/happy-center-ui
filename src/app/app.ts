import { Component } from '@angular/core';
import { ContactSection } from './home/contact-section/contact-section';
import { CourseCatalog } from './home/course-catalog/course-catalog';
import { Hero } from './home/hero/hero';
import { HowItWorks } from './home/how-it-works/how-it-works';
import { SiteFooter } from './layout/site-footer/site-footer';
import { SiteHeader } from './layout/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [SiteHeader, Hero, CourseCatalog, HowItWorks, ContactSection, SiteFooter],
  template: `
    <app-site-header />
    <main>
      <app-hero />
      <app-course-catalog />
      <app-how-it-works />
      <app-contact-section />
    </main>
    <app-site-footer />
  `,
})
export class App {}

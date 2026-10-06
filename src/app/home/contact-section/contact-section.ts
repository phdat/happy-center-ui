import { Component } from '@angular/core';
import { ContactForm } from '../contact-form/contact-form';

@Component({
  selector: 'app-contact-section',
  imports: [ContactForm],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.css',
})
export class ContactSection {
  // TODO: điền thông tin thật của trung tâm
  protected readonly info = {
    address: 'Hòa Bình, Vĩnh Long',
    hotline: '090-000-0000',
    hotlineTel: '',
    hours: 'T2-CN 8:00-21:00',
  };
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  protected readonly stickers = [
    { label: 'Kids', variant: 'white', pos: 's1' },
    { label: 'Excel', variant: 'blue', pos: 's2' },
    { label: 'VSTEP A1-B2', variant: 'yellow', pos: 's3' },
    { label: 'AI', variant: 'white', pos: 's4' },
  ];
}

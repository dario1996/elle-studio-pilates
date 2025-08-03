import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  constructor(private element: ElementRef) {}

  counter = 0;

  @Input('appImgFallback')
  handleImgError?: string;

  @HostListener('error', ['$event'])
  handleImageError(event: Event): void {
    console.log('Attivato image fallback' + this.counter++);

    if (this.counter < 3) {
      const image = event.target as HTMLInputElement;
      image.src = this.handleImgError ?? './assets/images/noimage.png'; // e.g. ./assets/images/default-image.png
    }
  }
}

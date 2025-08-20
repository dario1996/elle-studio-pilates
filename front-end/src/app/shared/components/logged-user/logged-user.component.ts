import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthJwtService } from '../../../../../src/app/core/services/authJwt.service'; // Modifica il path se necessario
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-logged-user',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './logged-user.component.html',
  styleUrl: './logged-user.component.css',
  animations: [
    trigger('dropdownAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LoggedUserComponent implements OnInit {
  isLogged = false;
  userName: string | null = '';
  displayName: string | null = '';
  email: string | null = '';
  showDropdown = false;

  constructor(private BasicAuth: AuthJwtService, private router: Router, private eRef: ElementRef) {}
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showDropdown && this.eRef && !this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    this.isLogged = this.BasicAuth.isLogged();
    this.userName = this.BasicAuth.loggedUser();
    this.displayName = this.BasicAuth.loggedUserDisplayName();
    this.email = this.BasicAuth.loggedUserEmail?.();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.BasicAuth.clearAll();
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }
}
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { AvatarComponent } from '../../../../core/avatar/avatar.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [RouterModule, AvatarComponent, NgClass, CommonModule],
})
export class WelcomeComponent implements OnInit {
  menuItems = [
    {
      title: 'Dashboard',
      icon: 'fa-solid fa-tachometer-alt fa-xl',
      links: [
        {
          label: 'Dashboard',
          url: 'dashboard',
          icon: 'fa-solid fa-tachometer-alt fa-lg',
        },
      ],
    },
    {
      title: 'Calendario',
      icon: 'fa-solid fa-graduation-cap fa-xl',
      links: [
        {
          label: 'Calendario',
          url: 'piano-formativo',
          icon: 'fa-solid fa-graduation-cap fa-lg',
        },
      ],
    },
    {
      title: 'Gestione utenti',
      icon: 'fa-solid fa-users fa-xl',
      links: [
        {
          label: 'Gestione utenti',
          url: 'dipendenti',
          icon: 'fa-solid fa-users fa-lg',
        },
      ],
    },
    {
      title: 'Gestione pacchetti',
      icon: 'fa-solid fa-book fa-xl',
      links: [
        {
          label: 'Gestione pacchetti',
          url: 'corsi',
          icon: 'fa-solid fa-book fa-lg',
        },
      ],
    },
    {
      title: 'Statistiche',
      icon: 'fa-solid fa-chart-simple fa-xl',
      links: [
        {
          label: 'Statistiche',
          url: 'impostazioni',
          icon: 'fa-solid fa-chart-simple fa-lg',
        },
      ],
    },
  ];

  isOpen: boolean[] = [];
  selectedLink: any = null;
  utente = '';

  isSidebarOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public BasicAuth: AuthJwtService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth > 991.98) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 991.98) {
      this.isSidebarOpen = false;
    }
  }

  ngOnInit(): void {
    this.isOpen = Array(this.menuItems.length).fill(false); // inizializza tutti chiusi
    this.utente = this.route.snapshot.params['userid'];
  }

  errore = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(error: any) {
    console.log(error);
    this.errore = error.error.message;
  }

  toggleAccordion(index: number): void {
    this.isOpen[index] = !this.isOpen[index];
  }

  selectLink(link: any): void {
    this.selectedLink = link;
  }

  logout() {
    // Sostituisci con il tuo servizio di logout se necessario
    // Esempio:
    //this.authService.logout();
    this.router.navigate(['/login']);
  }
}

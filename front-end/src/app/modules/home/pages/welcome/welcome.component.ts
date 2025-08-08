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
  userFullName: string = '';

  isSidebarOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public BasicAuth: AuthJwtService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth > 991.98) {
      // this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // closeSidebarOnMobile() {
  //   if (window.innerWidth <= 991.98) {
  //     this.isSidebarOpen = false;
  //   }
  // }

  ngOnInit(): void {
    this.isOpen = Array(this.menuItems.length).fill(false);
    this.utente = this.route.snapshot.params['userid'];
    this.loadUserData();
  }

  /**
   * Carica nome e cognome REALI dalla tabella utenti (invece dell'username formattato)
   */
  private loadUserData(): void {
    if (this.BasicAuth.isLogged()) {
      console.log('=== DEBUG LOAD USER DATA ===');
      console.log('Utente loggato:', this.BasicAuth.loggedUser());
      console.log('Token presente:', !!this.BasicAuth.getAuthToken());
      console.log('Token expired:', this.BasicAuth.isTokenExpired());

      console.log('Caricamento nome e cognome dalla tabella...');

      this.BasicAuth.getUserName().subscribe({
        next: userData => {
          console.log('✅ Dati ricevuti con successo:', userData);

          if (userData.nome && userData.cognome) {
            // Formatta nome e cognome REALI dal database: "Cognome Nome"
            const nomeFormattato =
              userData.nome.charAt(0).toUpperCase() +
              userData.nome.slice(1).toLowerCase();
            const cognomeFormattato =
              userData.cognome.charAt(0).toUpperCase() +
              userData.cognome.slice(1).toLowerCase();
            this.userFullName = `${cognomeFormattato} ${nomeFormattato}`;

            console.log('👤 Nome completo dal DB:', this.userFullName);
          } else {
            console.log(
              '⚠️ Nome/cognome vuoti nel DB, uso username formattato come fallback',
            );
            // Solo se nome/cognome sono NULL o vuoti nel database
            const username = this.BasicAuth.loggedUser() || 'user';
            this.userFullName = this.formatUsername(username);
          }

          console.log('🎯 Nome finale visualizzato:', this.userFullName);
        },
        error: error => {
          console.error('❌ Errore nel recuperare dati utente:', error);
          console.log('🔄 Fallback: uso username formattato');

          // Fallback: usa username formattato solo se l'API fallisce
          const username = this.BasicAuth.loggedUser() || 'user';
          this.userFullName = this.formatUsername(username);
          console.log('🎯 Nome fallback:', this.userFullName);
        },
      });
    } else {
      console.log('❌ Utente non loggato');
      this.setDefaultUserData();
    }
  }

  /**
   * Formatta username da "rossi.villa" a "Rossi Villa"
   */
  private formatUsername(username: string): string {
    if (!username || username === 'user') {
      return 'Utente Sconosciuto';
    }

    if (username.includes('.')) {
      return username
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  }

  /**
   * Imposta dati utente di default
   */
  private setDefaultUserData(): void {
    const username = this.BasicAuth.loggedUser() || 'user';
    this.userFullName = this.formatUsername(username);
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

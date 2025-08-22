import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { Ruoli } from '../../../../shared/models/Ruoli';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [
    RouterModule, 
    // NgClass, 
    CommonModule],
})
export class WelcomeComponent implements OnInit {
  allMenuItems = [
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
      roles: [Ruoli.amministratore, Ruoli.utente], // Accessibile a entrambi
    },
    {
      title: 'Calendario',
      icon: 'fa-solid fa-graduation-cap fa-xl',
      links: [
        {
          label: 'Calendario',
          url: 'agenda',
          icon: 'fa-solid fa-graduation-cap fa-lg',
        },
      ],
      roles: [Ruoli.amministratore], // Solo amministratori
    },
    {
      title: 'Gestione utenti',
      icon: 'fa-solid fa-users fa-xl',
      links: [
        {
          label: 'Utenti',
          url: 'gestione-utenti',
          icon: 'fa-solid fa-users fa-lg',
        },
      ],
      roles: [Ruoli.amministratore], // Solo amministratori
    },
    {
      title: 'Gestione corsi',
      icon: 'fa-solid fa-book fa-xl',
      links: [
        {
          label: 'Gestione corsi',
          url: 'corsi',
          icon: 'fa-solid fa-book fa-lg',
        },
      ],
      roles: [Ruoli.amministratore], // Solo amministratori
    },
    {
      title: 'Il mio profilo',
      icon: 'fa-solid fa-user fa-xl',
      links: [
        {
          label: 'Il mio profilo',
          url: 'impostazioni',
          icon: 'fa-solid fa-user fa-lg',
        },
      ],
      roles: [Ruoli.amministratore, Ruoli.utente], // Accessibile a entrambi (ma sostituisce "Statistiche")
    },
  ];

  menuItems: any[] = [];
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
    this.filterMenuByRole();
    this.isOpen = Array(this.menuItems.length).fill(false);
    this.utente = this.route.snapshot.params['userid'];
    this.loadUserData();
  }

  /**
   * Filtra i menu items in base al ruolo dell'utente
   */
  private filterMenuByRole(): void {
    const userRoles = this.BasicAuth.getUserRoles();
    console.log('Ruoli utente per filtro menu:', userRoles);

    if (userRoles.includes(Ruoli.amministratore)) {
      // Amministratore: tutti i menu tranne "Il mio profilo", aggiungi "Statistiche"
      this.menuItems = this.allMenuItems.filter(item => 
        item.roles.includes(Ruoli.amministratore) && item.title !== 'Il mio profilo'
      );
      // Aggiungi voce Statistiche per amministratori
      this.menuItems.push({
        title: 'Statistiche',
        icon: 'fa-solid fa-chart-simple fa-xl',
        links: [
          {
            label: 'Statistiche',
            url: 'statistiche',
            icon: 'fa-solid fa-chart-simple fa-lg',
          },
        ],
        roles: [Ruoli.amministratore],
      });
    } else if (userRoles.includes(Ruoli.utente)) {
      // Utente normale: solo Dashboard e Il mio profilo
      this.menuItems = [
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
          roles: [Ruoli.utente],
        },
        {
          title: 'Il mio profilo',
          icon: 'fa-solid fa-user fa-xl',
          links: [
            {
              label: 'Il mio profilo',
              url: 'impostazioni',
              icon: 'fa-solid fa-user fa-lg',
            },
          ],
          roles: [Ruoli.utente],
        }
      ];
    }

    console.log('Menu filtrati:', this.menuItems);
  }

  /**
   * Carica nome e cognome dalla response di login (senza chiamate HTTP aggiuntive)
   */
  private loadUserData(): void {
    if (this.BasicAuth.isLogged()) {
      console.log('=== DEBUG LOAD USER DATA ===');
      console.log('Utente loggato:', this.BasicAuth.loggedUser());
      console.log('Display name dal login:', this.BasicAuth.loggedUserDisplayName());

      // Usa direttamente il displayName dalla response di login
      const displayName = this.BasicAuth.loggedUserDisplayName();
      
      if (displayName && displayName.trim() !== '' && !displayName.includes('@')) {
        // DisplayName presente e valido (non è un username o email)
        this.userFullName = displayName;
        console.log('✅ Usando displayName dal login:', this.userFullName);
      } else {
        // Fallback: formatta username se displayName non disponibile
        const username = this.BasicAuth.loggedUser() || 'user';
        this.userFullName = this.formatUsername(username);
        console.log('🔄 Fallback su username formattato:', this.userFullName);
      }

      console.log('🎯 Nome finale visualizzato:', this.userFullName);
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

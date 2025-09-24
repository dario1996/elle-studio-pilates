import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../core/notification/notification.component';
import { LoggedUserComponent } from '../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../core/page-title/page-title.component';
import { UserService } from '../../core/services/data/user.service';
import { AuthJwtService } from '../../core/services/authJwt.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-account-panel',
  standalone: true,
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.css'],
  imports: [CommonModule, PageTitleComponent, NotificationComponent, LoggedUserComponent],
})
export class AccountPanelComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthJwtService);

  title: string = 'Informazioni Account';

  // Fallback object structure matching DB `utenti` table - real data will override from API
  user: any = {
    id: null,
    username: null,
    email: null,
    nome: null,
    cognome: null,
    codice_fiscale: null,
    certificato_medico: null,
    patologie: null,
    descrizione_patologie: null,
    obiettivi: null,
    telefono: null,
    azienda: null,
    attivo: null,
    data_creazione: null,
    password: null,
    ruoli: [],
  };

  // display helper: show '-' when value is null/empty/undefined
  display(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  // patologie helper: show 'Nessuna' when value is 0, otherwise show content
  displayPatologie(patologie: any): string {
    if (patologie === null || patologie === undefined || patologie === '') return '-';
    if (patologie === 0 || patologie === '0') return 'Nessuna';
    return String(patologie);
  }

  // status helper: normalize attivo field
  displayStatus(attivo: any): string {
    if (attivo === null || attivo === undefined) return '-';
    // possible values in DB may be 'Si'/'No' or '1'/'0' or boolean
    if (attivo === 'Si' || attivo === 'si' || attivo === '1' || attivo === 1 || attivo === true) return 'Attivo';
    return 'Disabilitato';
  }

  ngOnInit(): void {
    const username = this.auth.loggedUser();
    if (username) {
      this.userService.getUtenteByUsername(username).subscribe({
        next: (u) => {
          // Handle field mapping between API response and component user object
          this.user = {
            ...this.user,
            id: u.username || this.user.id, // use username as id if no id field
            username: u.username,
            email: u.email,
            nome: u.nome,
            cognome: u.cognome,
            // Handle both camelCase and snake_case from API
            codice_fiscale: u.codiceFiscale || (u as any).codice_fiscale || this.user.codice_fiscale,
            certificato_medico: u.certificatoMedico || (u as any).certificato_medico || this.user.certificato_medico,
            patologie: u.patologie,
            descrizione_patologie: u.descrizionePatologie || (u as any).descrizione_patologie || this.user.descrizione_patologie,
            obiettivi: u.obiettivi,
            telefono: (u as any).telefono || this.user.telefono, // might not be in IUsers interface
            azienda: (u as any).azienda || this.user.azienda, // might not be in IUsers interface
            attivo: u.attivo,
            data_creazione: u.dataCreazione || (u as any).data_creazione || this.user.data_creazione,
            password: this.user.password, // keep hidden
            ruoli: u.ruoli || [],
          };
          console.log('User data loaded from API:', this.user);
        },
        error: (err) => {
          console.warn('Impossibile caricare utente da API, uso dati fallback', err);
        },
      });
    }
  }

  changePassword(): void {
    // placeholder: real implementation should open a modal or navigate to change-password page
    // For now we just log — this can be replaced with a proper flow later.
    console.log('Cambia password clicked');
    alert('Apri la procedura per cambiare la password (da implementare)');
  }
}

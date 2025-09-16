import { Component } from '@angular/core';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../../../core/notification/notification.component';

@Component({
  selector: 'app-gestione-prenotazioni',
  templateUrl: './gestione-prenotazioni.component.html',
  styleUrls: ['./gestione-prenotazioni.component.css'],
  standalone: true,
  imports: [CommonModule, PageTitleComponent, LoggedUserComponent],
})
export class GestionePrenotazioniComponent {

    title: string = 'Prenotazioni';

}
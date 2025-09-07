import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../core/notification/notification.component';
import { LoggedUserComponent } from '../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../core/page-title/page-title.component';

@Component({
  selector: 'app-account-panel',
  standalone: true,
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.css'],
  imports: [CommonModule, PageTitleComponent, NotificationComponent, LoggedUserComponent],
})
export class AccountPanelComponent {

    title: string = 'Informazioni Account';
  // Mock dati utente
  user = {
    nome: 'Paola D\'Andrea',
    email: 'p_dandrea@hotmail.com',
    indirizzo: 'Via Cristoforo Colombo, Roma, IT',
    telefono: '+39 3472729703',
    azienda: 'Paola D\'Andrea, IT 12197911006',
    stato: 'Disabilitato',
    dataIscrizione: '2025-05-28 13:17',
    password: '********',
    social: [],
  };
}

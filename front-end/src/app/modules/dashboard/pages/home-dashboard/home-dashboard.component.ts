import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css'],
  imports: [PageTitleComponent, LoggedUserComponent, NotificationComponent],
})
export class HomeDashboardComponent implements OnInit {

  title: string = 'Dashboard';
  icon: string = 'fa-solid fa-tachometer-alt';

  constructor() {}

  ngOnInit(): void {
    // Inizializzazione component
  }
}
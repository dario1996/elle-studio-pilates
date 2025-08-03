import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent implements OnInit {
  @Input()
  isLogged = false;
  @Input('count')
  notCount: number = 0;
  @Input()
  userName: string | null = '';
  
  modalTitle = '';
  isPanelOpen: boolean = false;
  isOpenModal = false;
  isNotificationOpen: boolean = false;
  hasNewNotifications: boolean = false;
  newNotifications: Notification[] = [];
  unreadNotifications: Notification[] = [];

constructor() {
    // Mock data per test
    this.newNotifications = [
      {
        id: 1,
        message: 'Nuovo corso disponibile: Angular Avanzato',
        type: 'info',
        timestamp: new Date(),
        read: false
      }
    ];

    this.unreadNotifications = [
      {
        id: 2,
        message: 'Ricordati di completare il corso Java',
        type: 'warning',
        timestamp: new Date(Date.now() - 86400000), // 1 giorno fa
        read: false
      }
    ];
  }

  ngOnInit(): void {
    this.updateNotificationCount();
  }

  openModal() {
    this.isOpenModal = true;
    this.modalTitle = 'Notifiche';
  }

  closeModal() {
    this.isOpenModal = false;
  }

  togglePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
    this.isNotificationOpen = this.isPanelOpen;
    if (this.isPanelOpen) {
      // Quando il pannello viene aperto, aggiorniamo lo stato delle notifiche
      this.hasNewNotifications = false;
    }
  }

  private updateNotificationCount(): void {
    this.notCount = this.newNotifications.length + this.unreadNotifications.length;
    this.hasNewNotifications = this.newNotifications.length > 0;
  }

}

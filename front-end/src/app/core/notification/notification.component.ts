/* eslint-disable @angular-eslint/no-input-rename */
import { Component, OnInit, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  imports: [CommonModule, NgClass]
})
export class NotificationComponent implements OnInit {
  @Input('count')
  notCount: number = 0;

  isOpenModal = false;
  isNotificationOpen: boolean = false;
  modalTitle = '';

  isPanelOpen: boolean = false;
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

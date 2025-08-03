import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css'],
  imports: [PageTitleComponent],
})
export class HomeDashboardComponent implements OnInit {

  title: string = 'Dashboard';
  icon: string = 'fa-solid fa-tachometer-alt';

  constructor() {}

  ngOnInit(): void {
    // Inizializzazione component
  }
}
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
})
export class LogoutComponent implements OnInit {
  titolo = 'Logout';
  sottotitolo = 'Procedi ad inserire la userid e la password';

  constructor(private auth: AuthJwtService) {}

  ngOnInit(): void {
    this.auth.clearAll();
    localStorage.clear();
    sessionStorage.clear();
  }
}

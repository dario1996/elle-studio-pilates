import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthJwtService } from '../../../../../src/app/core/services/authJwt.service'; // Modifica il path se necessario

@Component({
  selector: 'app-logged-user',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './logged-user.component.html',
  styleUrl: './logged-user.component.css',
})
export class LoggedUserComponent implements OnInit {
  isLogged = false;
  userName: string | null = '';
  displayName: string | null = '';
  email: string | null = '';
  showDropdown = false;

  constructor(private BasicAuth: AuthJwtService, private router: Router) {}

  ngOnInit(): void {
    this.isLogged = this.BasicAuth.isLogged();
    this.userName = this.BasicAuth.loggedUser();
    this.displayName = this.BasicAuth.loggedUserDisplayName();
    this.email = this.BasicAuth.loggedUserEmail?.();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.BasicAuth.clearAll();
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }
}
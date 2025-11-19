import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { LoginService } from './services/login.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
// ✅ IMPORTACIONES CORRECTAS DE ANGULAR MATERIAL
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgIf,
    CommonModule,
    SidebarComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.css'] // ✅ plural
})


export class AppComponent {
  title = 'TranspoBL';
   showSiderbar = signal(true);

  role: string = '';

  isSideNavCollapsed = false;
  screenWidth = 0;

  constructor(private loginService: LoginService, private router: Router) {
    if (this.verificar()) {
      this.router.navigate(['/dashboard']);
    }
  }
  cerrar() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
  verificar() {
    this.role = this.loginService.showRole();
    return this.loginService.verificar();
  }
  isGerente() {
    return this.role === 'GERENTE';
  }
  isAdministrador() {
    return this.role === 'ADMINISTRADOR';
  }
   isConductor() {
    return this.role === 'CONDUCTOR';
  }
  toggleSidebar() {
    this.showSiderbar.set(!this.showSiderbar());
  }
  
  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}

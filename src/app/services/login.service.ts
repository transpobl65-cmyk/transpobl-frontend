import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtRequest } from '../models/jwRequest';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}

  login(request: JwtRequest){
    return this.http.post(environment.base + '/login', request);
  }

  verificar() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let token = sessionStorage.getItem('token');
      return token != null;
    }
    return false;
  }


  showRole() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let token = sessionStorage.getItem('token');
      if (!token) {
        return null;
      }
      const helper = new JwtHelperService();
      const decodedToken = helper.decodeToken(token);
      return decodedToken?.role;
    }
    return null;
  }
  showUsername(): string {
  const token = sessionStorage.getItem('token');
  if (!token) return '';

  // Extraer el payload del token JWT (segunda parte)
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.sub; // 👈 normalmente el username viene en "sub"
}

}

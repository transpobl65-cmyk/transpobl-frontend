// src/app/services/asignaciones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginService } from './login.service';
import { Asignacion } from '../models/Asignaciones';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class AsignacionesService {
 private url = `${base_url}/asignaciones`;
  private listaCambio = new Subject<Asignacion[]>();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🔹 CRUD
  insert(asignacion: Asignacion): Observable<any> {
    return this.http.post(this.url, asignacion, { headers: this.getAuthHeaders() });
  }

  update(asignacion: Asignacion): Observable<any> {
    return this.http.put(this.url, asignacion, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  list(): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(this.url, { headers: this.getAuthHeaders() });
  }

  listId(id: number): Observable<Asignacion> {
    return this.http.get<Asignacion>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔄 Reactividad
  setList(listaNueva: Asignacion[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<Asignacion[]> {
    return this.listaCambio.asObservable();
  }

getConductores(): Observable<any[]> {
  const token = sessionStorage.getItem('token');
  return this.http.get<any[]>(`${base_url}/usuarios/users/conductores`, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  });
}



}

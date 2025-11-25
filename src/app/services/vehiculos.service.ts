// src/app/services/vehiculos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehiculo } from '../models/Vehiculos';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private url = `${base_url}/vehiculos`;
  private listaCambio = new Subject<Vehiculo[]>();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  insert(vehiculo: Vehiculo): Observable<any> {
  const { id, ...payload } = vehiculo;   // 💡 Quita el id sin usar delete
  return this.http.post(this.url, payload, {
    headers: this.getAuthHeaders()
  });
}

  update(vehiculo: Vehiculo): Observable<any> {
    return this.http.put(this.url, vehiculo, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  list(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.url, { headers: this.getAuthHeaders() });
  }

  listId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔄 Reactividad
  setList(listaNueva: Vehiculo[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<Vehiculo[]> {
    return this.listaCambio.asObservable();
  }
}

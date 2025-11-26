// src/app/services/historialestadovehiculo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { HistorialEstadoVehiculo } from '../models/HistorialEstadoVehiculo';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class HistorialestadovehiculoService {
   private url = `${base_url}/historial-vehiculo`;
  private listaCambio = new Subject<HistorialEstadoVehiculo[]>();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

insert(historial: HistorialEstadoVehiculo): Observable<any> {
  const { id, ...payload } = historial;

  // 🔥 Enviar solo el id del vehículo, ignorando el resto
  payload.vehiculo = { id: historial.vehiculo.id } as any;

  return this.http.post(this.url, payload, {
    headers: this.getAuthHeaders()
  });
}



  update(historial: HistorialEstadoVehiculo): Observable<any> {
    return this.http.put(this.url, historial, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  list(): Observable<HistorialEstadoVehiculo[]> {
    return this.http.get<HistorialEstadoVehiculo[]>(this.url, { headers: this.getAuthHeaders() });
  }

  listId(id: number): Observable<HistorialEstadoVehiculo> {
    return this.http.get<HistorialEstadoVehiculo>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔄 Reactividad
  setList(listaNueva: HistorialEstadoVehiculo[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<HistorialEstadoVehiculo[]> {
    return this.listaCambio.asObservable();
  }
}

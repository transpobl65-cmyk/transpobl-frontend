import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Solicitud } from '../models/Solicitudes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Vehiculo } from '../models/Vehiculos';
import { tap } from 'rxjs/operators';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {

  private url = `${base_url}/solicitudes`;
  private listaCambio = new Subject<Solicitud[]>();

  constructor(private http: HttpClient) {}

  // ✅ Headers con token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

 insert(solicitud: Solicitud): Observable<any> {
  const { id, ...payload } = solicitud;
  return this.http.post(this.url, payload, { headers: this.getAuthHeaders() });
}

  // 🟡 Modificar solicitud
  update(solicitud: Solicitud): Observable<any> {
    return this.http.put(this.url, solicitud, { headers: this.getAuthHeaders() });
  }

  // 🔴 Eliminar solicitud
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔍 Listar por ID
  listId(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

    // 📋 Listar todas las solicitudes
  list(): Observable<Solicitud[]> {
    return this.http
      .get<Solicitud[]>(this.url, { headers: this.getAuthHeaders() })
      .pipe(tap(res => console.log('📌 RAW SOLICITUDES BACKEND:', res)));
  }


  // 🚛 NUEVO → Listar todos los vehículos (para el combo select)
  listVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${base_url}/vehiculos`, { headers: this.getAuthHeaders() });
  }

  // 🔁 Reactividad
  setList(listaNueva: Solicitud[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<Solicitud[]> {
    return this.listaCambio.asObservable();
  }
}

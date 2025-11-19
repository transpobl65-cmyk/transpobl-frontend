import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { GastosConductor } from '../models/GastosConductor';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const base_url = environment.base; // 🟡 Asegúrate que en environment.ts tengas: base: 'http://localhost:8081'

@Injectable({
  providedIn: 'root'
})
export class GastosConductorService {
  private url = `${base_url}/gastos-conductor`;
  private listaCambio = new Subject<GastosConductor[]>();

  constructor(private http: HttpClient) {}

  // ✅ Encabezado con token
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ================== CRUD ==================

list(): Observable<GastosConductor[]> {
  return this.http.get<GastosConductor[]>(this.url, { headers: this.getAuthHeaders() });
}


  listId(id: number): Observable<GastosConductor> {
    return this.http.get<GastosConductor>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  insert(gasto: GastosConductor): Observable<any> {
    return this.http.post(this.url, gasto, { headers: this.getAuthHeaders() });
  }

  update(gasto: GastosConductor): Observable<any> {
    return this.http.put(this.url, gasto, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔹 Asignaciones del conductor autenticado
  getAsignacionesPorConductor(): Observable<any[]> {
    return this.http.get<any[]>(`${base_url}/gastos-conductor/mis-asignaciones`, {
      headers: this.getAuthHeaders()
    });
  }

  // ================== REACTIVIDAD ==================
  setList(listaNueva: GastosConductor[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<GastosConductor[]> {
    return this.listaCambio.asObservable();
  }

}




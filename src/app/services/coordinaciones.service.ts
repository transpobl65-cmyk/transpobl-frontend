import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Coordinacion } from '../models/Coordinaciones';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class CoordinacionesService {

 private url = `${base_url}/coordinaciones`;
  private listaCambio = new Subject<Coordinacion[]>();

  constructor(private http: HttpClient) {}

  // ✅ Generar encabezado con token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ================== 🔹 CRUD ==================

  // Crear una coordinación
  insert(coordinacion: Coordinacion): Observable<any> {
    return this.http.post(this.url, coordinacion, { headers: this.getAuthHeaders() });
  }

  // Modificar una coordinación existente
  update(coordinacion: Coordinacion): Observable<any> {
    return this.http.put(this.url, coordinacion, { headers: this.getAuthHeaders() });
  }

  // Eliminar una coordinación por ID
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

// ================== LISTAR TODAS LAS COORDINACIONES ==================
list(): Observable<Coordinacion[]> {
  return this.http.get<Coordinacion[]>(this.url, { headers: this.getAuthHeaders() });
}


  // Buscar coordinación por ID
  listId(id: number): Observable<Coordinacion> {
    return this.http.get<Coordinacion>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // ================== 🔄 Reactividad ==================

  setList(listaNueva: Coordinacion[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<Coordinacion[]> {
    return this.listaCambio.asObservable();
  }
}

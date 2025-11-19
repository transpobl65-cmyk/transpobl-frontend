import { Injectable } from '@angular/core';
import { GastosEmpresa } from '../models/GastosEmpresa';
import { LoginService } from './login.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class GastosEmpresaService {
  private url = `${base_url}/gastos-empresa`;
  private listaCambio = new Subject<GastosEmpresa[]>();

  constructor(private http: HttpClient, private loginService: LoginService) {}

  // Genera headers con el token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🟢 Registrar gasto
  insert(gasto: GastosEmpresa): Observable<any> {
    return this.http.post(this.url, gasto, { headers: this.getAuthHeaders() });
  }

  // 🟢 Listar todos
  list(): Observable<GastosEmpresa[]> {
    return this.http.get<GastosEmpresa[]>(this.url, { headers: this.getAuthHeaders() });
  }

  // 🟡 Modificar
  update(gasto: GastosEmpresa): Observable<any> {
    return this.http.put(this.url, gasto, { headers: this.getAuthHeaders() });
  }

  // 🔴 Eliminar
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔍 Listar por ID
  listId(id: number): Observable<GastosEmpresa> {
    return this.http.get<GastosEmpresa>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔄 Observable reactivo (para actualizar listas)
  setList(listaNueva: GastosEmpresa[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<GastosEmpresa[]> {
    return this.listaCambio.asObservable();
  }

  // 💰 (opcional) Obtener suma total de gastos
  getTotalGastos(): Observable<number> {
    return this.http.get<number>(`${this.url}/total`, { headers: this.getAuthHeaders() });
  }
  // 🔍 Buscar gastos por palabra clave (categoría o descripción)
search(term: string): Observable<GastosEmpresa[]> {
  return this.http.get<GastosEmpresa[]>(`${this.url}/buscar?term=${term}`, {
    headers: this.getAuthHeaders()
  });
}

}
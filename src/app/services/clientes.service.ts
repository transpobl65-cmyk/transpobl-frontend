import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Cliente } from '../models/CuotasMensualesConductor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
 private url = `${base_url}/clientes`;
  private listaCambio = new Subject<Cliente[]>();

  constructor(private http: HttpClient) {}

  // ✅ Headers con token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🟢 Registrar cliente
  insert(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente, { headers: this.getAuthHeaders() });
  }

  // 🟡 Modificar cliente
  update(cliente: Cliente): Observable<any> {
    return this.http.put(this.url, cliente, { headers: this.getAuthHeaders() });
  }

  // 🔴 Eliminar cliente
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔍 Listar por ID
  listId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 📋 Listar todos los clientes
  list(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url, { headers: this.getAuthHeaders() });
  }

  // 🔁 Reactividad (para actualizar lista)
  setList(listaNueva: Cliente[]) {
    this.listaCambio.next(listaNueva);
  }

  getList(): Observable<Cliente[]> {
    return this.listaCambio.asObservable();
  }
}

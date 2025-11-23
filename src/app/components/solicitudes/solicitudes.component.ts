import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../models/CuotasMensualesConductor';
import { Solicitud } from '../../models/Solicitudes';
import { ClientesService } from '../../services/clientes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { LoginService } from '../../services/login.service';
import { VehiculosService } from '../../services/vehiculos.service';
import { Vehiculo } from '../../models/Vehiculos';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})
export class SolicitudesComponent implements OnInit{
  // 🧍 Clientes
  clientes: Cliente[] = [];
  cliente: Cliente = new Cliente();
  clienteBuscado = '';
  paginaCliente = 1;
  itemsCliente = 3;

  // 🚚 Solicitudes
  solicitudes: Solicitud[] = [];
  solicitud: Solicitud = new Solicitud();

  vehiculos: Vehiculo[] = [];


  searchTerm = '';
  paginaActual = 1;
  itemsPorPagina = 3;

constructor(
  private clientesService: ClientesService,
  private solicitudesService: SolicitudesService,
  private vehiculosService: VehiculosService, // 👈 nuevo
  private loginService: LoginService
) {}


  ngOnInit(): void {
    this.cargarDatos();
  }

cargarDatos() {
  this.clientesService.list().subscribe(c => this.clientes = c);
  this.vehiculosService.list().subscribe(v => this.vehiculos = v);
  this.solicitudesService.list().subscribe(s => {
    console.log('Solicitudes:', s);  // Agrega esto para verificar los datos
    this.solicitudes = s;
  });
}


  // 🧍 CRUD CLIENTES
  guardarCliente() {
    if (!this.cliente.nombre || !this.cliente.rucDni) {
      alert('⚠️ Complete los campos del cliente.');
      return;
    }

    const accion$ = this.cliente.id
      ? this.clientesService.update(this.cliente)
      : this.clientesService.insert(this.cliente);

    accion$.subscribe(() => {
      alert(this.cliente.id ? '✅ Cliente actualizado correctamente.' : '✅ Cliente registrado correctamente.');
      this.cliente = new Cliente();
      this.cargarDatos();
    });
  }

  editarCliente(c: Cliente) {
    this.cliente = JSON.parse(JSON.stringify(c));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarCliente(id: number) {
    if (confirm('¿Eliminar este cliente?')) {
      this.clientesService.delete(id).subscribe(() => this.cargarDatos());
    }
  }

  cancelarCliente() {
    this.cliente = new Cliente();
  }

  // 🚚 CRUD SOLICITUDES
 guardarSolicitud() {
  if (!this.solicitud.cliente || !this.solicitud.destino || !this.solicitud.fechaSalida) {
    alert('⚠️ Complete los campos de la solicitud.');
    return;
  }

  this.solicitud.usuario.username = this.loginService.showUsername();

  console.log('📦 Enviando solicitud:', this.solicitud); // 👈 agrega esto para verificar

  const accion$ = this.solicitud.id
    ? this.solicitudesService.update(this.solicitud)
    : this.solicitudesService.insert(this.solicitud);

  accion$.subscribe(() => {
    alert(this.solicitud.id ? '✅ Solicitud actualizada correctamente.' : '✅ Solicitud registrada correctamente.');
    this.solicitud = new Solicitud();
    this.cargarDatos();
  });
}

  editarSolicitud(s: Solicitud) {
    this.solicitud = JSON.parse(JSON.stringify(s));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarSolicitud(id: number) {
    if (confirm('¿Eliminar esta solicitud?')) {
      this.solicitudesService.delete(id).subscribe(() => this.cargarDatos());
    }
  }

  cancelarSolicitud() {
    this.solicitud = new Solicitud();
  }

  // 🔍 Búsqueda solicitudes
  buscar() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.cargarDatos();
      return;
    }
    this.solicitudes = this.solicitudes.filter(s =>
      s.cliente.nombre.toLowerCase().includes(term) || s.destino.toLowerCase().includes(term)
    );
  }

  // 🔍 Búsqueda clientes
  buscarCliente() {
    const term = this.clienteBuscado.toLowerCase();
    if (!term) {
      this.cargarDatos();
      return;
    }
    this.clientes = this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(term) || c.rucDni.toLowerCase().includes(term)
    );
  }

  // 📄 Paginación
  get totalPaginas(): number {
    return Math.ceil(this.solicitudes.length / this.itemsPorPagina);
  }

  cambiarPagina(direccion: number) {
    const nueva = this.paginaActual + direccion;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.paginaActual = nueva;
  }

  get totalPaginasClientes(): number {
    return Math.ceil(this.clientes.length / this.itemsCliente);
  }

  cambiarPaginaCliente(direccion: number) {
    const nueva = this.paginaCliente + direccion;
    if (nueva >= 1 && nueva <= this.totalPaginasClientes) this.paginaCliente = nueva;
  }
}

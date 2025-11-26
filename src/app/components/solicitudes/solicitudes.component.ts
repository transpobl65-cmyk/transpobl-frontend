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
export class SolicitudesComponent implements OnInit {
  // 🧍 CLIENTES
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  cliente: Cliente = new Cliente();
  clienteBuscado = '';
  paginaCliente = 1;
  itemsCliente = 3;

  // 🚚 SOLICITUDES
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  solicitud: Solicitud = new Solicitud();

  vehiculos: Vehiculo[] = [];

  searchTerm = '';
  paginaSolicitud = 1;
  itemsSolicitud = 3;

  constructor(
    private clientesService: ClientesService,
    private solicitudesService: SolicitudesService,
    private vehiculosService: VehiculosService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // 🔁 Cargar todo (clientes, vehículos, solicitudes)
  cargarDatos() {
    this.clientesService.list().subscribe(c => {
      this.clientes = c || [];
      this.clientesFiltrados = [...this.clientes];
      this.paginaCliente = 1;
    });

    this.vehiculosService.list().subscribe(v => {
      this.vehiculos = v || [];
    });

    this.solicitudesService.list().subscribe(s => {
      console.log('📌 SOLICITUDES RECIBIDAS:', s);
      this.solicitudes = s || [];
      this.solicitudesFiltradas = [...this.solicitudes];
      this.paginaSolicitud = 1;
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
      alert(
        this.cliente.id
          ? '✅ Cliente actualizado correctamente.'
          : '✅ Cliente registrado correctamente.'
      );
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
    if (
      !this.solicitud.cliente ||
      !this.solicitud.cliente.id ||
      !this.solicitud.vehiculo ||
      !this.solicitud.vehiculo.id ||
      !this.solicitud.destino ||
      !this.solicitud.fechaSalida
    ) {
      alert('⚠️ Complete los campos de la solicitud.');
      return;
    }

    // usuario autenticado
    this.solicitud.usuario.username = this.loginService.showUsername();

    console.log('📦 Enviando solicitud:', this.solicitud);

    const accion$ = this.solicitud.id
      ? this.solicitudesService.update(this.solicitud)
      : this.solicitudesService.insert(this.solicitud);

    accion$.subscribe({
      next: () => {
        alert(
          this.solicitud.id
            ? '✅ Solicitud actualizada correctamente.'
            : '✅ Solicitud registrada correctamente.'
        );
        this.solicitud = new Solicitud();
        this.cargarDatos();
      },
      error: err => {
        console.error('❌ Error al guardar solicitud:', err);
        alert('Ocurrió un error al guardar la solicitud (revisa la consola).');
      }
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

  // 🔍 Búsqueda solicitudes (no destruye la lista original)
  buscarSolicitud() {
    const term = (this.searchTerm || '').trim().toLowerCase();

    if (!term) {
      this.solicitudesFiltradas = [...this.solicitudes];
    } else {
      this.solicitudesFiltradas = this.solicitudes.filter(s =>
        (s.cliente?.nombre || '').toLowerCase().includes(term) ||
        (s.destino || '').toLowerCase().includes(term) ||
        (s.vehiculo?.placa || '').toLowerCase().includes(term)
      );
    }
    this.paginaSolicitud = 1;
  }

  // 🔍 Búsqueda clientes
  buscarCliente() {
    const term = (this.clienteBuscado || '').trim().toLowerCase();

    if (!term) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(c =>
        (c.nombre || '').toLowerCase().includes(term) ||
        (c.rucDni || '').toLowerCase().includes(term)
      );
    }
    this.paginaCliente = 1;
  }

  // 📄 Paginación CLIENTES
  get totalPaginasClientes(): number {
    return Math.max(1, Math.ceil(this.clientesFiltrados.length / this.itemsCliente));
  }

  cambiarPaginaCliente(direccion: number) {
    const nueva = this.paginaCliente + direccion;
    if (nueva >= 1 && nueva <= this.totalPaginasClientes) {
      this.paginaCliente = nueva;
    }
  }

  // 📄 Paginación SOLICITUDES
  get totalPaginasSolicitudes(): number {
    return Math.max(1, Math.ceil(this.solicitudesFiltradas.length / this.itemsSolicitud));
  }

  cambiarPaginaSolicitud(direccion: number) {
    const nueva = this.paginaSolicitud + direccion;
    if (nueva >= 1 && nueva <= this.totalPaginasSolicitudes) {
      this.paginaSolicitud = nueva;
    }
  }
}
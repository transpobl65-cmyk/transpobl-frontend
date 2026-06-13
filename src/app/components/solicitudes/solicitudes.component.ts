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
import { HistorialestadovehiculoService } from '../../services/historialestadovehiculo.service';
import { HistorialEstadoVehiculo } from '../../models/HistorialEstadoVehiculo';

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
historiales: HistorialEstadoVehiculo[] = [];
  // 🚚 SOLICITUDES
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  solicitud: Solicitud = new Solicitud();

  vehiculos: Vehiculo[] = [];

  role: string | null = null;

  // búsqueda + paginación solicitudes
  searchTerm = '';
  paginaActual = 1;
  itemsPorPagina = 3;

// agrega estas variables
clienteIntentado = false;
solicitudIntentada = false;
fechaSalidaInput: string = '';
errorCliente = '';
errorSolicitud = '';

constructor(
  private clientesService: ClientesService,
  private solicitudesService: SolicitudesService,
  private vehiculosService: VehiculosService,
  private historialService: HistorialestadovehiculoService, // ← agrega
  private loginService: LoginService
) {}
  ngOnInit(): void {
      this.role = this.loginService.showRole();
    this.cargarDatos();
  }

  // 🔄 CARGAR TODO DESDE EL BACKEND
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
      console.log('📌 RAW SOLICITUDES DESDE API:', s);
      this.solicitudes = s || [];
      this.solicitudesFiltradas = [...this.solicitudes];
      this.paginaActual = 1;
    });
    this.historialService.list().subscribe(h => {
  this.historiales = h || [];
});



  }

  // 🧍 CRUD CLIENTES
guardarCliente() {
  this.clienteIntentado = true;
  this.errorCliente = '';

  if (!this.cliente.nombre?.trim() || !this.cliente.telefono?.trim()) {
    this.errorCliente = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
    return;
  }

  const accion$ = this.cliente.id
    ? this.clientesService.update(this.cliente)
    : this.clientesService.insert(this.cliente);

  accion$.subscribe(() => {
    alert(this.cliente.id ? '✅ Cliente actualizado correctamente.' : '✅ Cliente registrado correctamente.');
    this.cliente = new Cliente();
    this.clienteIntentado = false;
    this.errorCliente = '';
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
  this.clienteIntentado = false;
  this.errorCliente = '';
}
  // 🚚 CRUD SOLICITUDES
guardarSolicitud() {
  this.solicitudIntentada = true;
  this.errorSolicitud = '';

  if (
    !this.solicitud.cliente?.id ||
    !this.solicitud.vehiculo?.id ||
    !this.solicitud.destino?.trim() ||
    !(this.solicitud.precio > 0) ||
    !this.fechaSalidaInput
  ) {
    this.errorSolicitud = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
    return;
  }

  // ✅ Validar estado del vehículo desde historial
  const historialVehiculo = this.historiales
    .filter(h => h.vehiculo?.id === this.solicitud.vehiculo.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const ultimoEstado = historialVehiculo[0]?.estado?.toUpperCase();
  const estadosNoPermitidos = ['MANTENIMIENTO', 'ASIGNADO', 'NO DISPONIBLE', 'EN OPERACION'];

  if (ultimoEstado && estadosNoPermitidos.includes(ultimoEstado)) {
    this.errorSolicitud = `⚠️ El vehículo está en estado "${historialVehiculo[0].estado}" y no está disponible para una nueva solicitud.`;
    return;
  }

  this.solicitud.fechaSalida = new Date(this.fechaSalidaInput) as any;
  this.solicitud.usuario.username = this.loginService.showUsername();

  const accion$ = this.solicitud.id
    ? this.solicitudesService.update(this.solicitud)
    : this.solicitudesService.insert(this.solicitud);

  accion$.subscribe({
    next: () => {
      alert(this.solicitud.id ? '✅ Solicitud actualizada.' : '✅ Solicitud registrada.');
      this.solicitud = new Solicitud();
      this.fechaSalidaInput = '';
      this.solicitudIntentada = false;
      this.errorSolicitud = '';
      this.cargarDatos();
    },
    error: (err) => {
      console.error('❌ Error al guardar solicitud:', err);
      alert('Ocurrió un error al guardar la solicitud.');
    }
  });
}



editarSolicitud(s: Solicitud) {
  this.solicitud = JSON.parse(JSON.stringify(s));
  this.fechaSalidaInput = new Date(s.fechaSalida).toISOString().split('T')[0];
  this.solicitudIntentada = false;
  this.errorSolicitud = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

  eliminarSolicitud(id: number) {
    if (confirm('¿Eliminar esta solicitud?')) {
      this.solicitudesService.delete(id).subscribe(() => this.cargarDatos());
    }
  }

cancelarSolicitud() {
  this.solicitud = new Solicitud();
  this.fechaSalidaInput = '';
  this.solicitudIntentada = false;
  this.errorSolicitud = '';
}
  // 🔍 BÚSQUEDA SOLICITUDES (se trabaja sobre solicitudesFiltradas)
  buscar() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.solicitudesFiltradas = [...this.solicitudes];
    } else {
      this.solicitudesFiltradas = this.solicitudes.filter(s => {
        const nombre = s.cliente?.nombre?.toLowerCase() || '';
        const ruc = s.cliente?.rucDni?.toLowerCase() || '';
        const destino = s.destino?.toLowerCase() || '';
        const vehiculoTxt = `${s.vehiculo?.placa || ''} ${s.vehiculo?.marca || ''}`.toLowerCase();
        return (
          nombre.includes(term) ||
          ruc.includes(term) ||
          destino.includes(term) ||
          vehiculoTxt.includes(term)
        );
      });
    }
    this.paginaActual = 1;
  }

  // 🔍 BÚSQUEDA CLIENTES (igual que arriba pero con clientesFiltrados)
  buscarCliente() {
    const term = (this.clienteBuscado || '').toLowerCase().trim();
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

  // 📄 PAGINACIÓN SOLICITUDES (sobre lista filtrada)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.solicitudesFiltradas.length / this.itemsPorPagina));
  }

  cambiarPagina(direccion: number) {
    const nueva = this.paginaActual + direccion;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.paginaActual = nueva;
  }

  // 📄 PAGINACIÓN CLIENTES (sobre lista filtrada)
  get totalPaginasClientes(): number {
    return Math.max(1, Math.ceil(this.clientesFiltrados.length / this.itemsCliente));
  }

  cambiarPaginaCliente(direccion: number) {
    const nueva = this.paginaCliente + direccion;
    if (nueva >= 1 && nueva <= this.totalPaginasClientes) this.paginaCliente = nueva;
  }
}
import { Component, OnInit } from '@angular/core';
import { HistorialestadovehiculoService } from '../../services/historialestadovehiculo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Vehiculo } from '../../models/Vehiculos';
import { HistorialEstadoVehiculo } from '../../models/HistorialEstadoVehiculo';
import { VehiculosService } from '../../services/vehiculos.service';
import { AsignacionesService } from '../../services/asignaciones.service';
import { Asignacion } from '../../models/Asignaciones';
import { SolicitudesService } from '../../services/solicitudes.service';
import { Solicitud } from '../../models/Solicitudes';

@Component({
  selector: 'app-estadocarros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadocarros.component.html',
  styleUrl: './estadocarros.component.css'
})
export class EstadoCarrosComponent implements OnInit {

  // ── Vehículos ──────────────────────────────────────
  vehiculos: Vehiculo[] = [];
  vehiculo: Vehiculo = new Vehiculo();
  searchVehiculo = '';
  paginaVehiculo = 1;
  itemsVehiculo = 3;
  vehiculoIntentado = false;
  tipoPersonalizado = false;

  // ── Historial ──────────────────────────────────────
  historiales: HistorialEstadoVehiculo[] = [];
  historial: HistorialEstadoVehiculo = new HistorialEstadoVehiculo();
  vehiculoSeleccionadoId: number = 0;
  searchHistorial = '';
  paginaHistorial = 1;
  itemsHistorial = 3;
  historialIntentado = false;

  // ── Asignaciones ───────────────────────────────────
  asignaciones: Asignacion[] = [];
  asignacion: Asignacion = new Asignacion();
  solicitudSeleccionadaId: number = 0;
  vehiculoAsignadoId: number = 0;
  conductorSeleccionadoId: number = 0;
  solicitudes: Solicitud[] = [];
  conductores: any[] = [];
  searchAsignacion = '';
  paginaAsignacion = 1;
  itemsAsignacion = 3;
  asignacionIntentado = false;

  // ── Auth ───────────────────────────────────────────
  role: string | null = null;

  constructor(
    private vehiculosService: VehiculosService,
    private historialService: HistorialestadovehiculoService,
    private asignacionesService: AsignacionesService,
    private solicitudesService: SolicitudesService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.role = this.loginService.showRole();
    this.cargarTodo();
  }

  cargarTodo() {
    this.vehiculosService.list().subscribe(v => (this.vehiculos = v));
    this.historialService.list().subscribe(h => (this.historiales = h));
    this.asignacionesService.list().subscribe(a => (this.asignaciones = a));
    this.solicitudesService.list().subscribe(s => (this.solicitudes = s));

    this.asignacionesService.getConductores().subscribe(users => {
      this.conductores = users.filter((u: any) =>
        u.roles?.some((r: any) => r.rol?.toUpperCase() === 'CONDUCTOR')
      );
    });
  }

  // ══════════════════════════════════════════════════
  // VEHÍCULOS
  // ══════════════════════════════════════════════════

  guardarVehiculo() {
    this.vehiculoIntentado = true;
    if (!this.vehiculo.placa || !this.vehiculo.tipo || !this.vehiculo.estadoActual) return;

    const accion$ = this.vehiculo.id
      ? this.vehiculosService.update(this.vehiculo)
      : this.vehiculosService.insert(this.vehiculo);

    accion$.subscribe(() => {
      alert(this.vehiculo.id ? '✅ Vehículo actualizado' : '✅ Vehículo registrado');
      this.limpiarVehiculo();
      this.vehiculosService.list().subscribe(v => (this.vehiculos = v));
    });
  }

  editarVehiculo(v: Vehiculo) {
    this.vehiculo = JSON.parse(JSON.stringify(v));
    const listaFija = ['Volquete', 'Excavadora', 'Cargador Frontal', 'Camión Plataforma', 'Grúa'];
    this.tipoPersonalizado = !!v.tipo && !listaFija.includes(v.tipo);
  }

  eliminarVehiculo(id: number) {
    if (confirm('¿Eliminar vehículo?')) {
      this.vehiculosService.delete(id).subscribe(() => this.cargarTodo());
    }
  }

  buscarVehiculo() {
    const term = this.searchVehiculo.toLowerCase();
    if (!term) return this.cargarTodo();
    this.vehiculos = this.vehiculos.filter(v =>
      v.placa.toLowerCase().includes(term) ||
      v.marca.toLowerCase().includes(term) ||
      v.modelo.toLowerCase().includes(term)
    );
  }

  limpiarVehiculo() {
    this.vehiculo = new Vehiculo();
    this.tipoPersonalizado = false;
    this.vehiculoIntentado = false;
  }

  // ══════════════════════════════════════════════════
  // HISTORIAL
  // ══════════════════════════════════════════════════

  guardarHistorial() {
    this.historialIntentado = true;
    if (!this.historial.vehiculo?.id || !this.historial.estado || !this.historial.fecha) return;

    if (typeof this.historial.vehiculo.id === 'string') {
      this.historial.vehiculo.id = Number(this.historial.vehiculo.id);
    }

    const accion$ = this.historial.id
      ? this.historialService.update(this.historial)
      : this.historialService.insert(this.historial);

    accion$.subscribe({
      next: () => {
        alert(this.historial.id ? '✅ Historial actualizado' : '✅ Historial registrado');
        this.limpiarHistorial();
        this.historialService.list().subscribe(h => (this.historiales = h));
      },
      error: (err) => {
        console.error('❌ Error al registrar historial:', err);
        alert('Ocurrió un error al registrar el historial.');
      }
    });
  }

  editarHistorial(h: HistorialEstadoVehiculo) {
    this.historial = JSON.parse(JSON.stringify(h));
  }

  eliminarHistorial(id: number) {
    if (confirm('¿Eliminar historial?')) {
      this.historialService.delete(id).subscribe(() => this.cargarTodo());
    }
  }

  buscarHistorial() {
    const term = this.searchHistorial.toLowerCase();
    if (!term) return this.cargarTodo();
    this.historiales = this.historiales.filter(h =>
      h.estado.toLowerCase().includes(term) ||
      h.vehiculo.placa.toLowerCase().includes(term)
    );
  }

  limpiarHistorial() {
    this.historial = new HistorialEstadoVehiculo();
    this.vehiculoSeleccionadoId = 0;
    this.historialIntentado = false;
  }

  // ══════════════════════════════════════════════════
  // ASIGNACIONES
  // ══════════════════════════════════════════════════

  guardarAsignacion() {
    this.asignacionIntentado = true;
    if (
      !this.solicitudSeleccionadaId ||
      !this.vehiculoAsignadoId ||
      !this.conductorSeleccionadoId ||
      !this.asignacion.estado ||
      !this.asignacion.inicio ||
      !this.asignacion.fin
    ) return;

    const solicitudSeleccionada = this.solicitudes.find(s => s.id === Number(this.solicitudSeleccionadaId));
    const vehiculoSeleccionado = this.vehiculos.find(v => v.id === Number(this.vehiculoAsignadoId));
    const conductorSeleccionado = this.conductores.find(c => c.id === Number(this.conductorSeleccionadoId));

    if (!solicitudSeleccionada || !vehiculoSeleccionado || !conductorSeleccionado) {
      alert('❌ No se pudo encontrar uno de los elementos seleccionados.');
      return;
    }

    this.asignacion.solicitud = solicitudSeleccionada;
    this.asignacion.vehiculo = vehiculoSeleccionado;
    this.asignacion.conductor = {
      id: conductorSeleccionado.id,
      username: conductorSeleccionado.username
    };
    this.asignacion.inicio = new Date(this.asignacion.inicio);
    this.asignacion.fin = new Date(this.asignacion.fin);

    const accion$ = this.asignacion.id
      ? this.asignacionesService.update(this.asignacion)
      : this.asignacionesService.insert(this.asignacion);

    accion$.subscribe({
      next: () => {
        alert(this.asignacion.id ? '✅ Asignación actualizada' : '✅ Asignación registrada');
        this.limpiarAsignacion();
        this.cargarTodo();
      },
      error: (err) => {
        console.error('❌ Error al registrar asignación:', err);
        alert('Ocurrió un error al registrar la asignación.');
      }
    });
  }

  editarAsignacion(a: Asignacion) {
    this.asignacion = JSON.parse(JSON.stringify(a));
  }

  eliminarAsignacion(id: number) {
    if (confirm('¿Eliminar asignación?')) {
      this.asignacionesService.delete(id).subscribe(() => this.cargarTodo());
    }
  }

  buscarAsignacion() {
    const term = this.searchAsignacion.toLowerCase();
    if (!term) return this.cargarTodo();
    this.asignaciones = this.asignaciones.filter(a =>
      a.vehiculo.placa.toLowerCase().includes(term) ||
      a.conductor.username.toLowerCase().includes(term)
    );
  }

  limpiarAsignacion() {
    this.asignacion = new Asignacion();
    this.solicitudSeleccionadaId = 0;
    this.vehiculoAsignadoId = 0;
    this.conductorSeleccionadoId = 0;
    this.asignacionIntentado = false;
  }

  // ══════════════════════════════════════════════════
  // PAGINACIÓN
  // ══════════════════════════════════════════════════

  get totalVehiculos(): number {
    return Math.ceil(this.vehiculos.length / this.itemsVehiculo);
  }

  get totalHistorial(): number {
    return Math.ceil(this.historiales.length / this.itemsHistorial);
  }

  get totalAsignaciones(): number {
    return Math.ceil(this.asignaciones.length / this.itemsAsignacion);
  }

  cambiarPaginaVehiculo(d: number) {
    const nueva = this.paginaVehiculo + d;
    if (nueva >= 1 && nueva <= this.totalVehiculos) this.paginaVehiculo = nueva;
  }

  cambiarPaginaHistorial(d: number) {
    const nueva = this.paginaHistorial + d;
    if (nueva >= 1 && nueva <= this.totalHistorial) this.paginaHistorial = nueva;
  }

  cambiarPaginaAsignacion(d: number) {
    const nueva = this.paginaAsignacion + d;
    if (nueva >= 1 && nueva <= this.totalAsignaciones) this.paginaAsignacion = nueva;
  }
}
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
  errorVehiculo = '';

  // ── Historial ──────────────────────────────────────
  historiales: HistorialEstadoVehiculo[] = [];
  historial: HistorialEstadoVehiculo = new HistorialEstadoVehiculo();
  vehiculoSeleccionadoId: number = 0;
  searchHistorial = '';
  paginaHistorial = 1;
  itemsHistorial = 3;
  historialIntentado = false;
  errorHistorial = '';

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
  errorAsignacion = '';
// ── Variables string para fechas ───────────────────
fechaHistorialInput: string = '';
fechaInicioInput: string = '';
fechaFinInput: string = '';
anioVehiculoIntentado: boolean = false; // para marcar año obligatorio
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
  this.errorVehiculo = '';

  if (!this.vehiculo.placa?.trim() || !this.vehiculo.tipo?.trim() || !this.vehiculo.anio) {
    this.errorVehiculo = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
    return;
  }

  if (!this.vehiculo.id) {
    const placaExiste = this.vehiculos.some(
      v => v.placa.trim().toLowerCase() === this.vehiculo.placa.trim().toLowerCase()
    );
    if (placaExiste) {
      this.errorVehiculo = '⚠️ Ya existe un vehículo con esa placa. Verifica e intenta de nuevo.';
      return;
    }
  }

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
    this.vehiculoIntentado = false;
    this.errorVehiculo = '';
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
    this.errorVehiculo = '';
  }

  // ══════════════════════════════════════════════════
  // HISTORIAL
  // ══════════════════════════════════════════════════

guardarHistorial() {
  this.historialIntentado = true;
  this.errorHistorial = '';

  if (!this.historial.vehiculo?.id || !this.historial.estado?.trim() || !this.fechaHistorialInput) {
    this.errorHistorial = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
    return;
  }

  if (typeof this.historial.vehiculo.id === 'string') {
    this.historial.vehiculo.id = Number(this.historial.vehiculo.id);
  }

  // ✅ Validar que no exista ya un historial para ese vehículo (solo al crear)
  if (!this.historial.id) {
    const yaExiste = this.historiales.some(
      h => h.vehiculo?.id === Number(this.historial.vehiculo.id)
    );
    if (yaExiste) {
      this.errorHistorial = '⚠️ Este vehículo ya tiene un estado registrado. Usa el botón ✏️ para editarlo.';
      return;
    }
  }

  this.historial.fecha = new Date(this.fechaHistorialInput) as any;

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
  const d = new Date(h.fecha);
  this.fechaHistorialInput = d.toISOString().split('T')[0];
  this.historialIntentado = false;
  this.errorHistorial = '';
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
  this.fechaHistorialInput = '';
  this.historialIntentado = false;
  this.errorHistorial = '';
}

  // ══════════════════════════════════════════════════
  // ASIGNACIONES
  // ══════════════════════════════════════════════════
guardarAsignacion() {
  this.asignacionIntentado = true;
  this.errorAsignacion = '';

  if (
    !this.solicitudSeleccionadaId ||
    !this.vehiculoAsignadoId ||
    !this.conductorSeleccionadoId ||
    !this.asignacion.estado?.trim() ||
    !this.fechaInicioInput ||
    !this.fechaFinInput
  ) {
    this.errorAsignacion = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
    return;
  }

  const solicitudSeleccionada = this.solicitudes.find(s => s.id === Number(this.solicitudSeleccionadaId));
  const vehiculoSeleccionado = this.vehiculos.find(v => v.id === Number(this.vehiculoAsignadoId));
  const conductorSeleccionado = this.conductores.find(c => c.id === Number(this.conductorSeleccionadoId));

  if (!solicitudSeleccionada || !vehiculoSeleccionado || !conductorSeleccionado) {
    this.errorAsignacion = '❌ No se pudo encontrar uno de los elementos seleccionados.';
    return;
  }

  // ✅ Verificar último estado del vehículo en historial
  const historialDelVehiculo = this.historiales
    .filter(h => h.vehiculo?.id === vehiculoSeleccionado.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const ultimoEstado = historialDelVehiculo[0]?.estado?.toUpperCase();
  const estadosNoPermitidos = ['MANTENIMIENTO', 'ASIGNADO', 'NO DISPONIBLE', 'EN OPERACION'];

  if (ultimoEstado && estadosNoPermitidos.includes(ultimoEstado)) {
    this.errorAsignacion = `⚠️ El vehículo está en estado "${historialDelVehiculo[0].estado}" y no está disponible. Solo se pueden asignar vehículos en estado ACTIVO.`;
    return;
  }

  // ✅ Validar que no haya traslape de fechas con otra asignación del mismo vehículo
  const nuevaInicio = new Date(this.fechaInicioInput).getTime();
  const nuevaFin = new Date(this.fechaFinInput).getTime();

  if (nuevaFin <= nuevaInicio) {
    this.errorAsignacion = '⚠️ La fecha fin debe ser posterior a la fecha inicio.';
    return;
  }

  const traslape = this.asignaciones.some(a => {
    if (a.vehiculo?.id !== vehiculoSeleccionado.id) return false;
    if (this.asignacion.id && a.id === this.asignacion.id) return false; // edición
    const aInicio = new Date(a.inicio).getTime();
    const aFin = new Date(a.fin).getTime();
    return nuevaInicio < aFin && nuevaFin > aInicio;
  });

  if (traslape) {
    this.errorAsignacion = '⚠️ El vehículo ya tiene una asignación en ese rango de fechas. Verifica las fechas.';
    return;
  }

  this.asignacion.solicitud = solicitudSeleccionada;
  this.asignacion.vehiculo = vehiculoSeleccionado;
  this.asignacion.conductor = {
    id: conductorSeleccionado.id,
    username: conductorSeleccionado.username
  };
  this.asignacion.inicio = new Date(this.fechaInicioInput);
  this.asignacion.fin = new Date(this.fechaFinInput);

  const accion$ = this.asignacion.id
    ? this.asignacionesService.update(this.asignacion)
    : this.asignacionesService.insert(this.asignacion);

  accion$.subscribe({
    next: () => {
  const historialExistente = this.historiales.find(
    h => h.vehiculo?.id === vehiculoSeleccionado.id
  );

  const finalizarGuardado = () => {
    alert(this.asignacion.id ? '✅ Asignación actualizada' : '✅ Asignación registrada');
    this.limpiarAsignacion();
    this.cargarTodo();
  };

  if (historialExistente) {
    // Ya tiene historial → actualizar a ASIGNADO
    const historialActualizado = {
      ...historialExistente,
      estado: 'ASIGNADO',
      fecha: new Date(this.fechaInicioInput),
      notas: 'Asignado automáticamente al registrar asignación'
    };
    this.historialService.update(historialActualizado).subscribe(() => {
      finalizarGuardado();
    });
  } else {
    // No tiene historial → crear uno nuevo con estado ASIGNADO
    const nuevoHistorial = {
      vehiculo: { id: vehiculoSeleccionado.id },
      estado: 'ASIGNADO',
      fecha: new Date(this.fechaInicioInput),
      notas: 'Asignado automáticamente al registrar asignación'
    };
    this.historialService.insert(nuevoHistorial as any).subscribe(() => {
      finalizarGuardado();
    });
  }
},
    error: (err) => {
      console.error('❌ Error al registrar asignación:', err);
      alert('Ocurrió un error al registrar la asignación.');
    }
  });
}


editarAsignacion(a: Asignacion) {
  this.asignacion = JSON.parse(JSON.stringify(a));
  this.fechaInicioInput = new Date(a.inicio).toISOString().split('T')[0];
  this.fechaFinInput = new Date(a.fin).toISOString().split('T')[0];
  this.asignacionIntentado = false;
  this.errorAsignacion = '';
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
  this.fechaInicioInput = '';
  this.fechaFinInput = '';
  this.asignacionIntentado = false;
  this.errorAsignacion = '';
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
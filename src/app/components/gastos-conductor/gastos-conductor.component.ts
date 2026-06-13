import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GastosConductor } from '../../models/GastosConductor';
import { Asignacion } from '../../models/Asignaciones';
import { GastosConductorService } from '../../services/gastosconductor.service';
import { AsignacionesService } from '../../services/asignaciones.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-gastos-conductor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos-conductor.component.html',
  styleUrl: './gastos-conductor.component.css'
})
export class GastosConductorComponent implements OnInit {

  gastos: GastosConductor[] = [];
  gasto: GastosConductor = new GastosConductor();
  asignaciones: Asignacion[] = [];
  conductorUsername: string = '';

  searchGasto = '';
  pagina = 1;
  itemsPagina = 5;
  totalGastos: number = 0;

  gastoIntentado = false;
  errorGasto = '';

  tipoPersonalizado = false;
  proveedorPersonalizado = false;

  fechaInput: string = '';

  constructor(
    private gastosService: GastosConductorService,
    private asignacionesService: AsignacionesService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.conductorUsername = this.loginService.showUsername();
    this.cargarMisAsignaciones();
    this.cargarGastosConductor();
  }

  cargarMisAsignaciones() {
    this.gastosService.getAsignacionesPorConductor().subscribe({
      next: (data) => (this.asignaciones = data),
      error: (err) => console.error('❌ Error cargando asignaciones', err)
    });
  }

  cargarGastosConductor() {
    this.gastosService.list().subscribe({
      next: (g) => {
        this.gastos = g.filter(
          gasto => gasto.conductor?.username === this.conductorUsername
        );
        this.calcularTotal();
      },
      error: (err) => console.error('❌ Error al listar gastos:', err)
    });
  }

  calcularTotal() {
    this.totalGastos = this.gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  }

  onAsignacionSeleccionada() {
    if (this.gasto.asignacion?.id) {
      const asig = this.asignaciones.find(a => a.id === this.gasto.asignacion.id);
      if (asig) {
        this.gasto.placa = asig.vehiculo?.placa || '';
        this.gasto.ruta = asig.solicitud?.destino || '';
      }
    }
  }

  guardarGasto() {
    this.gastoIntentado = true;
    this.errorGasto = '';

    if (
      !this.gasto.asignacion?.id ||
      !this.gasto.tipo?.trim() ||
      !this.gasto.proveedor?.trim() ||
      !this.gasto.comprobante?.trim() ||
      !(this.gasto.monto > 0) ||
      !this.fechaInput
    ) {
      this.errorGasto = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
      return;
    }

    // ✅ Buscar asignación seleccionada
    const asignacionActual = this.asignaciones.find(
      a => a.id === Number(this.gasto.asignacion?.id)
    );

    if (asignacionActual) {
      // ✅ Parsear fecha del gasto en hora local
      const [fAnio, fMes, fDia] = this.fechaInput.split('-').map(Number);
      const fechaGasto = new Date(fAnio, fMes - 1, fDia);

      // ✅ Parsear fecha inicio en hora local
      const inicioRaw = new Date(asignacionActual.inicio);
      const fechaInicio = new Date(
        inicioRaw.getFullYear(),
        inicioRaw.getMonth(),
        inicioRaw.getDate()
      );

      // ✅ Parsear fecha fin en hora local
      const finRaw = new Date(asignacionActual.fin);
      const fechaFin = new Date(
        finRaw.getFullYear(),
        finRaw.getMonth(),
        finRaw.getDate()
      );

      if (fechaGasto < fechaInicio || fechaGasto > fechaFin) {
        const inicioFormateada = fechaInicio.toLocaleDateString('es-PE');
        const finFormateada = fechaFin.toLocaleDateString('es-PE');
        this.errorGasto = `⚠️ La fecha del gasto debe estar entre ${inicioFormateada} y ${finFormateada}, que es el periodo de la asignación.`;
        return;
      }
    }

    this.gasto.fecha = new Date(this.fechaInput) as any;
    this.gasto.conductor.username = this.conductorUsername;

    const accion$ = this.gasto.id
      ? this.gastosService.update(this.gasto)
      : this.gastosService.insert(this.gasto);

    accion$.subscribe({
      next: () => {
        alert(this.gasto.id ? '✅ Gasto actualizado' : '✅ Gasto registrado');
        this.limpiar();
        this.cargarGastosConductor();
      },
      error: (err) => console.error('❌ Error al guardar gasto:', err)
    });
  }

  editar(g: GastosConductor) {
    this.gasto = JSON.parse(JSON.stringify(g));
    this.fechaInput = new Date(g.fecha).toISOString().split('T')[0];
    const tiposFijos = ['Combustible', 'Comida', 'Hospedaje', 'Peaje', 'Mantenimiento'];
    const proveedoresFijos = ['Grifo Petroperu', 'Restaurante', 'Hotel', 'Farmacias', 'Ferretería'];
    this.tipoPersonalizado = !!g.tipo && !tiposFijos.includes(g.tipo);
    this.proveedorPersonalizado = !!g.proveedor && !proveedoresFijos.includes(g.proveedor);
    this.gastoIntentado = false;
    this.errorGasto = '';
  }

  eliminar(id: number) {
    if (confirm('¿Deseas eliminar este gasto?')) {
      this.gastosService.delete(id).subscribe(() => this.cargarGastosConductor());
    }
  }

  limpiar() {
    this.gasto = new GastosConductor();
    this.fechaInput = '';
    this.tipoPersonalizado = false;
    this.proveedorPersonalizado = false;
    this.gastoIntentado = false;
    this.errorGasto = '';
  }

  buscarGasto() {
    const term = this.searchGasto.toLowerCase();
    if (!term) return this.cargarGastosConductor();
    this.gastos = this.gastos.filter(g =>
      g.tipo?.toLowerCase().includes(term) ||
      g.proveedor?.toLowerCase().includes(term) ||
      g.placa?.toLowerCase().includes(term)
    );
    this.calcularTotal();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.gastos.length / this.itemsPagina));
  }

  cambiarPagina(delta: number) {
    const nueva = this.pagina + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.pagina = nueva;
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GastosConductor } from '../../models/GastosConductor';
import { Asignacion } from '../../models/Asignaciones';
import { GastosConductorService } from '../../services/gastosconductor.service';
import { AsignacionesService } from '../../services/asignaciones.service';

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

  // ── Validación ─────────────────────────────────────
  gastoIntentado = false;
  errorGasto = '';

  // ── Tipo personalizado ─────────────────────────────
  tipoPersonalizado = false;
  proveedorPersonalizado = false;

  // ── Comprobante ────────────────────────────────────
  archivoSeleccionado: File | null = null;
  archivoBase64: string = '';

  // ── Fecha ──────────────────────────────────────────
  fechaInput: string = '';

  constructor(
    private gastosService: GastosConductorService,
    private asignacionesService: AsignacionesService
  ) {}

  ngOnInit(): void {
    this.conductorUsername = sessionStorage.getItem('username') || '';
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
        this.gastos = g;
        this.calcularTotal();
      },
      error: (err) => console.error('❌ Error al listar gastos:', err)
    });
  }

  calcularTotal() {
    this.totalGastos = this.gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  }

  // ✅ Al elegir asignación autocompleta placa y ruta
  onAsignacionSeleccionada() {
    if (this.gasto.asignacion?.id) {
      const asig = this.asignaciones.find(a => a.id === this.gasto.asignacion.id);
      if (asig) {
        this.gasto.placa = asig.vehiculo?.placa || '';
        this.gasto.ruta = asig.solicitud?.destino || '';
      }
    }
  }

  // ✅ Archivo comprobante
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    if (tiposPermitidos.includes(file.type)) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.archivoBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Solo se permiten PDF, Word o imágenes (PNG, JPG).');
      event.target.value = '';
      this.archivoSeleccionado = null;
      this.archivoBase64 = '';
    }
  }

  guardarGasto() {
    this.gastoIntentado = true;
    this.errorGasto = '';

    if (
      !this.gasto.asignacion?.id ||
      !this.gasto.tipo?.trim() ||
      !this.gasto.proveedor?.trim() ||
      !(this.gasto.monto > 0) ||
      !this.fechaInput
    ) {
      this.errorGasto = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
      return;
    }

    // Comprobante obligatorio solo al crear
    if (!this.gasto.id && !this.archivoSeleccionado) {
      this.errorGasto = '⚠️ Debes adjuntar un comprobante antes de guardar.';
      return;
    }

    if (this.archivoSeleccionado) {
      this.gasto.comprobante = this.archivoSeleccionado.name;
      (this.gasto as any).comprobanteBase64 = this.archivoBase64;
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
    this.archivoSeleccionado = null;
    this.archivoBase64 = '';
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

  descargarComprobante(base64: string, nombre: string = 'comprobante') {
    const link = document.createElement('a');
    link.href = base64;
    link.download = nombre;
    link.click();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.gastos.length / this.itemsPagina));
  }

  cambiarPagina(delta: number) {
    const nueva = this.pagina + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.pagina = nueva;
  }
}
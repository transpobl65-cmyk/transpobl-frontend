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
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './gastos-conductor.component.html',
  styleUrl: './gastos-conductor.component.css'
})
export class GastosConductorComponent implements OnInit{

  gastos: GastosConductor[] = [];
  gasto: GastosConductor = new GastosConductor();
  asignaciones: Asignacion[] = [];
  conductorUsername: string = '';

  searchGasto = '';
  pagina = 1;
  itemsPagina = 5;

  totalGastos: number = 0; // 💰 total dinámico de gastos del conductor

  constructor(
    private gastosService: GastosConductorService,
    private asignacionesService: AsignacionesService
  ) {}
ngOnInit(): void {
  this.conductorUsername = sessionStorage.getItem('username') || '';
  this.cargarMisAsignaciones();
  this.cargarGastosConductor(); // 👈 agrega esta línea
}

cargarMisAsignaciones() {
  this.gastosService.getAsignacionesPorConductor().subscribe({
    next: (data) => {
      console.log("✅ Asignaciones del conductor:", data);
      this.asignaciones = data;
    },
    error: (err) => {
      console.error("❌ Error cargando asignaciones del conductor", err);
    }
  });
}


cargarGastosConductor() {
  this.gastosService.list().subscribe({
    next: (g) => {
      console.log("📦 Gastos desde backend:", g);
      this.gastos = g; // 👈 muestra todos los registros sin filtrar
      this.calcularTotal();
    },
    error: (err) => {
      console.error("❌ Error al listar gastos:", err);
    }
  });
}


  calcularTotal() {
    this.totalGastos = this.gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  }

guardarGasto() {
  console.log('🟢 Gasto antes de guardar:', this.gasto);

  if (!this.gasto.asignacion || !this.gasto.asignacion.id) {
    alert('⚠️ Debes seleccionar una asignación antes de guardar.');
    return;
  }

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
    error: (err) => {
      console.error('❌ Error al guardar gasto:', err);
    }
  });
}

  editar(g: GastosConductor) {
    this.gasto = JSON.parse(JSON.stringify(g));
  }

  eliminar(id: number) {
    if (confirm('¿Deseas eliminar este gasto?')) {
      this.gastosService.delete(id).subscribe(() => this.cargarGastosConductor());
    }
  }

  limpiar() {
    this.gasto = new GastosConductor();
  }

  buscarGasto() {
    const term = this.searchGasto.toLowerCase();
    if (!term) return this.cargarGastosConductor();
    this.gastos = this.gastos.filter(g =>
      g.tipo.toLowerCase().includes(term) ||
      g.proveedor.toLowerCase().includes(term) ||
      g.placa.toLowerCase().includes(term)
    );
    this.calcularTotal();
  }

  get totalPaginas(): number {
    return Math.ceil(this.gastos.length / this.itemsPagina);
  }

  cambiarPagina(delta: number) {
    const nueva = this.pagina + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.pagina = nueva;
  }
}

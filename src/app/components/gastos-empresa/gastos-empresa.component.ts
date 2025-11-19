import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GastosEmpresa } from '../../models/GastosEmpresa';
import { GastosEmpresaService } from '../../services/gastosempresa.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-gastos-empresa',
  standalone: true,
  imports: [FormsModule,CommonModule,MatPaginatorModule],
  templateUrl: './gastos-empresa.component.html',
  styleUrl: './gastos-empresa.component.css'
})
export class GastosEmpresaComponent implements OnInit{
   // datos
  lista: GastosEmpresa[] = [];
  listaFiltrada: GastosEmpresa[] = [];
  searchTerm = '';

  // paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  // formulario / validación
  gasto: GastosEmpresa = new GastosEmpresa();
  gastoIntentado = false;
  mostrarError = false;

  constructor(private service: GastosEmpresaService) {}

  ngOnInit() {
    this.cargarLista();
  }

  cargarLista() {
    this.service.list().subscribe(res => {
      this.lista = res || [];
      this.listaFiltrada = [...this.lista];
      this.paginaActual = 1;
    });
  }

  guardar() {
    this.gastoIntentado = true;
    this.mostrarError =
      !this.gasto.fecha || !this.gasto.categoria || !(this.gasto.monto > 0);
    if (this.mostrarError) return;

    const accion$ = this.gasto.id
      ? this.service.update(this.gasto)
      : this.service.insert(this.gasto);

    accion$.subscribe(() => {
      this.limpiar();
      this.cargarLista();
    });
  }

  editar(g: GastosEmpresa) {
    this.gasto = { ...g, fecha: new Date(g.fecha) } as any;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este gasto?')) return;
    this.service.delete(id).subscribe(() => {
      const esUltimo =
        (this.listaFiltrada.length - 1) % this.itemsPorPagina === 0;
      if (esUltimo && this.paginaActual > 1) this.paginaActual--;
      this.cargarLista();
    });
  }

  limpiar() {
    this.gasto = new GastosEmpresa();
    this.gastoIntentado = false;
    this.mostrarError = false;
  }

  buscar() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.listaFiltrada = [...this.lista];
    } else {
      this.listaFiltrada = this.lista.filter(
        g =>
          (g.categoria || '').toLowerCase().includes(term) ||
          (g.descripcion || '').toLowerCase().includes(term)
      );
    }
    this.paginaActual = 1;
  }

  // ✅ Se calcula sobre listaFiltrada
  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.listaFiltrada.length / this.itemsPorPagina)
    );
  }

  cambiarPagina(direccion: number) {
    const nuevaPagina = this.paginaActual + direccion;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

}

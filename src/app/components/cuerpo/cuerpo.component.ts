import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { VehiculosService } from '../../services/vehiculos.service';
import { GastosEmpresaService } from '../../services/gastosempresa.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AsignacionesService } from '../../services/asignaciones.service';
import { HistorialestadovehiculoService } from '../../services/historialestadovehiculo.service';
import { GastosConductorService } from '../../services/gastosconductor.service';
import { CoordinacionesService } from '../../services/coordinaciones.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { A11yModule } from "@angular/cdk/a11y";
Chart.register(...registerables);

// 🎨 Estilo GLOBAL para que todas las leyendas se vean blancas, grandes y bold
Chart.defaults.color = '#FFFFFF';

Chart.defaults.plugins.legend.labels.color = '#FFFFFF';
Chart.defaults.plugins.legend.labels.font = {
  size: 14,
  weight: 'bold'
};

// Tooltip también claro
Chart.defaults.plugins.tooltip.bodyColor = '#FFFFFF';
Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';

@Component({
  selector: 'app-cuerpo',
  standalone: true,
  imports: [A11yModule,
    CommonModule, FormsModule
  ],
  templateUrl: './cuerpo.component.html',
  styleUrl: './cuerpo.component.css'
})
export class CuerpoComponent implements AfterViewInit {

  
  // 🎨 Paleta moderna
  colores = [
    '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0',
    '#00BCD4', '#FF5252', '#8BC34A', '#FFC107', '#3F51B5'
  ];

  getColores(n: number) {
    return Array.from({ length: n }, (_, i) => this.colores[i % this.colores.length]);
  }

  estiloEjeTexto = {
    ticks: {
      color: '#FFF',
      font: { size: 13, weight: 'bold' as const }
    }
  };

  estiloEjeNumeros = {
    ticks: {
      color: '#FFF',
      font: { size: 13, weight: 'bold' as const }
    }
  };

  noHayDatos(arr: any[]) {
    return !arr || arr.length === 0;
  }

  // Mostrar u ocultar
  mostrarSolicitudes = false;
  mostrarGastosMes = false;
  mostrarCoordinaciones = false;

  // Selección de años
  aniosDisponibles = [2024, 2025, 2026, 2027];
  anioSeleccionado = 2025;

  // Indicadores
  totalVehiculos = 0;
  totalGastosEmpresaAnio = 0;
  totalGastosConductorAnio = 0;
  totalSolicitudes = 0;
  totalCoordinaciones = 0;
  totalClientes = 0;
  gananciaTotal = 0;

  // ViewChild referencias
  @ViewChild('chartFlota') chartFlota!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSolicitudesDestino') chartSolicitudesDestino!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartGastosMes') chartGastosMes!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCoordinaciones') chartCoordinaciones!: ElementRef<HTMLCanvasElement>;

  // Gráficos reales (para destruir)
  graficoFlota: any;
  graficoSolicitudes: any;
  graficoGastosMes: any;
  graficoCoordinaciones: any;

  constructor(
    private vehiculosService: VehiculosService,
    private historialService: HistorialestadovehiculoService,
    private gastosEmpresaService: GastosEmpresaService,
    private gastosConductorService: GastosConductorService,
    private solicitudesService: SolicitudesService,
    private asignacionesService: AsignacionesService,
    private coordinacionesService: CoordinacionesService
  ) {}

  ngAfterViewInit(): void {
    this.actualizarDashboard();
  }

  actualizarDashboard() {
    this.cargarIndicadores();
    this.loadFlotaChart();
    this.loadSolicitudesDestinoChart();
    this.loadGastosPorMes();
    this.loadCoordinacionesChart();
  }

  destruir(grafico: any) {
    if (grafico) grafico.destroy();
  }

  cargarIndicadores() {
    const year = this.anioSeleccionado;

    this.vehiculosService.list().subscribe(data => {
      this.totalVehiculos = data.length;
    });

    this.solicitudesService.list().subscribe(data => {
      const filtrado = data.filter(s => new Date(s.fechaSalida).getFullYear() === year);

      this.totalSolicitudes = filtrado.length;
      this.totalClientes = new Set(filtrado.map(s => s.cliente?.id)).size;
      this.gananciaTotal = filtrado.reduce((acc, s) => acc + (s.precio || 0), 0);
    });

    this.coordinacionesService.list().subscribe(data => {
      this.totalCoordinaciones = data
        .filter(c => new Date(c.solicitud.fechaSalida).getFullYear() === year)
        .length;
    });

    this.gastosEmpresaService.list().subscribe(data => {
      this.totalGastosEmpresaAnio = data
        .filter(g => new Date(g.fecha).getFullYear() === year)
        .reduce((acc, g) => acc + g.monto, 0);
    });

    this.gastosConductorService.list().subscribe(data => {
      this.totalGastosConductorAnio = data
        .filter(g => new Date(g.fecha).getFullYear() === year)
        .reduce((acc, g) => acc + g.monto, 0);
    });
  }

  // ==================== GRÁFICOS ====================

  loadFlotaChart() {
    this.vehiculosService.list().subscribe(data => {
      const counts: Record<string, number> = {};

      data.forEach(v => {
        const estado = v.estadoActual || 'Sin estado';
        counts[estado] = (counts[estado] || 0) + 1;
      });

      this.destruir(this.graficoFlota);

      this.graficoFlota = new Chart(this.chartFlota.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            data: Object.values(counts),
            backgroundColor: this.getColores(Object.keys(counts).length)
          }]
        }
      });
    });
  }

  loadSolicitudesDestinoChart() {
    this.solicitudesService.list().subscribe(data => {

      const filtrado = data.filter(s =>
        new Date(s.fechaSalida).getFullYear() === this.anioSeleccionado
      );

      this.destruir(this.graficoSolicitudes);

      if (filtrado.length === 0) return;

      const counts: Record<string, number> = {};
      filtrado.forEach(s => {
        const dest = s.destino || 'Sin destino';
        counts[dest] = (counts[dest] || 0) + 1;
      });

      this.graficoSolicitudes = new Chart(this.chartSolicitudesDestino.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Solicitudes',
            data: Object.values(counts),
            backgroundColor: this.getColores(Object.keys(counts).length)
          }]
        },
        options: { scales: { x: this.estiloEjeTexto, y: this.estiloEjeNumeros } }
      });
    });
  }

  loadGastosPorMes() {
    this.gastosEmpresaService.list().subscribe(data => {

      const filtrado = data.filter(g =>
        new Date(g.fecha).getFullYear() === this.anioSeleccionado
      );

      this.destruir(this.graficoGastosMes);

      if (filtrado.length === 0) return;

      const totals: Record<string, number> = {};
      filtrado.forEach(g => {
        const mes = new Date(g.fecha).toLocaleString('es-PE', { month: 'long' });
        totals[mes] = (totals[mes] || 0) + g.monto;
      });

      this.graficoGastosMes = new Chart(this.chartGastosMes.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(totals),
          datasets: [{
            label: 'Gastos (S/.)',
            data: Object.values(totals),
            backgroundColor: this.getColores(Object.keys(totals).length)
          }]
        },
        options: { scales: { x: this.estiloEjeTexto, y: this.estiloEjeNumeros } }
      });
    });
  }

  loadCoordinacionesChart() {
    this.coordinacionesService.list().subscribe(data => {

      const filtrado = data.filter(c =>
        new Date(c.solicitud.fechaSalida).getFullYear() === this.anioSeleccionado
      );

      this.destruir(this.graficoCoordinaciones);

      if (filtrado.length === 0) return;

      const counts: Record<string, number> = {};
      filtrado.forEach(c => {
        const cliente = c.solicitud?.cliente?.nombre || 'Sin cliente';
        counts[cliente] = (counts[cliente] || 0) + 1;
      });

      this.graficoCoordinaciones = new Chart(this.chartCoordinaciones.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Coordinaciones',
            data: Object.values(counts),
            backgroundColor: this.getColores(Object.keys(counts).length)
          }]
        },
        options: { scales: { x: this.estiloEjeTexto, y: this.estiloEjeNumeros } }
      });
    });
  }
}
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VehiculosService } from '../../services/vehiculos.service';
import { GastosEmpresaService } from '../../services/gastosempresa.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AsignacionesService } from '../../services/asignaciones.service';
import { Chart, registerables } from 'chart.js';
import { HistorialestadovehiculoService } from '../../services/historialestadovehiculo.service';
import { GastosConductorService } from '../../services/gastosconductor.service';
import { CoordinacionesService } from '../../services/coordinaciones.service';
Chart.register(...registerables)
@Component({
  selector: 'app-cuerpo',
  standalone: true,
  imports: [

  ],
  templateUrl: './cuerpo.component.html',
  styleUrl: './cuerpo.component.css'
})
export class CuerpoComponent implements AfterViewInit {
   // Referencias a los canvas
  @ViewChild('chartFlota') chartFlota!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartHistorial') chartHistorial!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartGastosCategoria') chartGastosCategoria!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartGastosConductor') chartGastosConductor!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSolicitudesDestino') chartSolicitudesDestino!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCoordinaciones') chartCoordinaciones!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMantenimientos') chartMantenimientos!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartAsignaciones') chartAsignaciones!: ElementRef<HTMLCanvasElement>;
@ViewChild('chartGastosMes') chartGastosMes!: ElementRef<HTMLCanvasElement>;

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
    this.loadFlotaChart();
    this.loadHistorialChart();
    this.loadGastosCategoriaChart();
    this.loadGastosConductorChart();
    this.loadSolicitudesDestinoChart();
    this.loadCoordinacionesChart();
    this.loadMantenimientosChart();
    this.loadAsignacionesChart();
    this.loadGastosPorMes();

  }

  // 1️⃣ Estado actual de la flota
  private loadFlotaChart() {
    this.vehiculosService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(v => {
        const estado = v.estadoActual || 'Sin estado';
        counts[estado] = (counts[estado] || 0) + 1;
      });

      new Chart(this.chartFlota.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(counts),
          datasets: [{ data: Object.values(counts) }]
        }
      });
    });
  }

  // 2️⃣ Historial de uso del vehículo (registros por día)
  private loadHistorialChart() {
    this.historialService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(h => {
        const fecha = new Date(h.fecha).toISOString().slice(0, 10);
        counts[fecha] = (counts[fecha] || 0) + 1;
      });

      new Chart(this.chartHistorial.nativeElement, {
        type: 'line',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Registros',
            data: Object.values(counts),
            fill: false,
            tension: 0.2
          }]
        }
      });
    });
  }

  // 3️⃣ Gastos empresa por categoría
  private loadGastosCategoriaChart() {
    this.gastosEmpresaService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(g => {
        const cat = g.categoria || 'Sin categoría';
        counts[cat] = (counts[cat] || 0) + (g.monto || 0);
      });

      new Chart(this.chartGastosCategoria.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Monto S/',
            data: Object.values(counts)
          }]
        }
      });
    });
  }

  // 4️⃣ Gastos por conductor
  private loadGastosConductorChart() {
    this.gastosConductorService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(g => {
        const nombre = g.conductor?.username || 'Sin nombre';
        counts[nombre] = (counts[nombre] || 0) + (g.monto || 0);
      });

      new Chart(this.chartGastosConductor.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Monto S/',
            data: Object.values(counts)
          }]
        },
        options: {
          indexAxis: 'y'
        }
      });
    });
  }

  // 5️⃣ Solicitudes por destino
  private loadSolicitudesDestinoChart() {
    this.solicitudesService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(s => {
        const dest = s.destino || 'Sin destino';
        counts[dest] = (counts[dest] || 0) + 1;
      });

      new Chart(this.chartSolicitudesDestino.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Solicitudes',
            data: Object.values(counts)
          }]
        }
      });
    });
  }

  // 6️⃣ Coordinaciones por cliente (usando solicitud.cliente.nombre)
  private loadCoordinacionesChart() {
    this.coordinacionesService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(c => {
        const nombre = c.solicitud?.cliente?.nombre || 'Sin cliente';
        counts[nombre] = (counts[nombre] || 0) + 1;
      });

      new Chart(this.chartCoordinaciones.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Coordinaciones',
            data: Object.values(counts)
          }]
        }
      });
    });
  }

  // 7️⃣ Mantenimientos por vehículo (filtrando estados que parezcan mantenimiento)
  private loadMantenimientosChart() {
    this.historialService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(h => {
        const estado = (h.estado || '').toLowerCase();
        if (estado.includes('manten') || estado.includes('averiado')) {
          const placa = h.vehiculo?.placa || 'Sin placa';
          counts[placa] = (counts[placa] || 0) + 1;
        }
      });

      new Chart(this.chartMantenimientos.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Mantenimientos',
            data: Object.values(counts)
          }]
        }
      });
    });
  }

  // 8️⃣ Asignaciones por conductor
  private loadAsignacionesChart() {
    this.asignacionesService.list().subscribe(data => {
      const counts: Record<string, number> = {};
      data.forEach(a => {
        const nombre = a.conductor?.username || 'Sin conductor';
        counts[nombre] = (counts[nombre] || 0) + 1;
      });

      new Chart(this.chartAsignaciones.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Asignaciones',
            data: Object.values(counts)
          }]
        }
      });
    });
  }

  private loadGastosPorMes() {
  this.gastosEmpresaService.list().subscribe(data => {
    const totals: Record<string, number> = {};

    data.forEach(g => {
      const fecha = new Date(g.fecha);
      const mes = fecha.toLocaleString('es-PE', { month: 'long' });

      totals[mes] = (totals[mes] || 0) + (g.monto || 0);
    });

    new Chart(this.chartGastosMes.nativeElement, {
      type: 'bar',
      data: {
        labels: Object.keys(totals),
        datasets: [{
          label: 'Gasto total (S/.)',
          data: Object.values(totals)
        }]
      }
    });
  });
}

}

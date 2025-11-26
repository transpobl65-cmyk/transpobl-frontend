import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Coordinacion } from '../../models/Coordinaciones';
import { Solicitud } from '../../models/Solicitudes';
import { SolicitudesService } from '../../services/solicitudes.service';
import { CoordinacionesService } from '../../services/coordinaciones.service';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com'; // 👈 Import EmailJS

@Component({
  selector: 'app-coordinacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './coordinacion.component.html',
  styleUrl: './coordinacion.component.css'
})
export class CoordinacionComponent implements OnInit{
coordinaciones: Coordinacion[] = [];
  coordinacion: Coordinacion = new Coordinacion();
  solicitudes: Solicitud[] = [];

  searchCoordinacion = '';
  pagina = 1;
  items = 4;

  archivoSeleccionado: File | null = null;
  archivoBase64: string = '';

  constructor(
    private coordinacionService: CoordinacionesService,
    private solicitudService: SolicitudesService
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  // ✅ Cargar datos iniciales
  cargarTodo() {
    this.coordinacionService.list().subscribe(c => (this.coordinaciones = c));
    this.solicitudService.list().subscribe(s => (this.solicitudes = s));
  }

  // ✅ Manejar archivo PDF
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.archivoBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Solo se permiten archivos PDF.');
      event.target.value = '';
      this.archivoSeleccionado = null;
      this.archivoBase64 = '';
    }
  }

  // ✅ Guardar coordinación y enviar correo
guardar() {
  // Guardar archivo si se ha seleccionado
  if (this.archivoSeleccionado) {
    this.coordinacion.archivoNombre = this.archivoSeleccionado.name;
    this.coordinacion.archivoBase64 = this.archivoBase64;
  }

  const accion$ = this.coordinacion.id
    ? this.coordinacionService.update(this.coordinacion)
    : this.coordinacionService.insert(this.coordinacion);

  accion$.subscribe(() => {
    alert(this.coordinacion.id ? '✅ Coordinación actualizada' : '✅ Coordinación registrada');

    // 👉 YA NO SE ENVÍA CORREO, SOLO GUARDA

    this.limpiar();
    this.cargarTodo();
  });
}


  editar(c: Coordinacion) {
    this.coordinacion = JSON.parse(JSON.stringify(c));
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar esta coordinación?')) {
      this.coordinacionService.delete(id).subscribe(() => this.cargarTodo());
    }
  }

  buscar() {
    const term = this.searchCoordinacion.toLowerCase();
    if (!term) return this.cargarTodo();
    this.coordinaciones = this.coordinaciones.filter(c =>
      c.emailEmpresa?.toLowerCase().includes(term) ||
      c.solicitud?.cliente?.nombre?.toLowerCase().includes(term)
    );
  }

  limpiar() {
    this.coordinacion = new Coordinacion();
    this.archivoSeleccionado = null;
    this.archivoBase64 = '';
  }

  get totalPaginas(): number {
    return Math.ceil(this.coordinaciones.length / this.items);
  }

  cambiarPagina(d: number) {
    const nueva = this.pagina + d;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.pagina = nueva;
  }

  // ✅ Descargar PDF
  descargarArchivo(base64: string, nombre: string = 'archivo.pdf') {
    const link = document.createElement('a');
    link.href = base64;
    link.download = nombre;
    link.click();
  }
}
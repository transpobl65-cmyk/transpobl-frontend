import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Coordinacion } from '../../models/Coordinaciones';
import { Solicitud } from '../../models/Solicitudes';
import { SolicitudesService } from '../../services/solicitudes.service';
import { CoordinacionesService } from '../../services/coordinaciones.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-coordinacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coordinacion.component.html',
  styleUrl: './coordinacion.component.css'
})
export class CoordinacionComponent implements OnInit {

  coordinaciones: Coordinacion[] = [];
  coordinacionesFiltradas: Coordinacion[] = [];
  coordinacion: Coordinacion = new Coordinacion();
  solicitudes: Solicitud[] = [];

  searchCoordinacion = '';
  pagina = 1;
  items = 4;

  archivoSeleccionado: File | null = null;
  archivoBase64: string = '';

  intentado = false;
  errorCoordinacion = '';

  role: string | null = null;

  constructor(
    private coordinacionService: CoordinacionesService,
    private solicitudService: SolicitudesService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.role = this.loginService.showRole();
    this.cargarTodo();
  }

  cargarTodo() {
    this.coordinacionService.list().subscribe(c => {
      this.coordinaciones = c;
      this.coordinacionesFiltradas = [...c];
    });
    this.solicitudService.list().subscribe(s => (this.solicitudes = s));
  }

  // ✅ Al elegir solicitud, autocompleta el email del cliente
  onSolicitudSeleccionada() {
    const solicitud = this.solicitudes.find(
      s => s.id === Number(this.coordinacion.solicitud.id)
    );
    if (solicitud?.cliente?.email) {
      this.coordinacion.emailEmpresa = solicitud.cliente.email;
    } else {
      this.coordinacion.emailEmpresa = '';
    }
  }

  // ✅ Acepta PDF, Word e imágenes
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
      alert('⚠️ Solo se permiten archivos PDF, Word o imágenes (PNG, JPG).');
      event.target.value = '';
      this.archivoSeleccionado = null;
      this.archivoBase64 = '';
    }
  }

  guardar() {
    this.intentado = true;
    this.errorCoordinacion = '';

    // ✅ Validar campos obligatorios
    if (!this.coordinacion.solicitud?.id || !this.coordinacion.emailEmpresa?.trim()) {
      this.errorCoordinacion = '⚠️ Por favor, completa los campos obligatorios antes de guardar.';
      return;
    }

    // ✅ Archivo obligatorio solo al crear
    if (!this.coordinacion.id && !this.archivoSeleccionado) {
      this.errorCoordinacion = '⚠️ Debes adjuntar un archivo antes de guardar.';
      return;
    }

    if (this.archivoSeleccionado) {
      this.coordinacion.archivoNombre = this.archivoSeleccionado.name;
      this.coordinacion.archivoBase64 = this.archivoBase64;
    }

    const accion$ = this.coordinacion.id
      ? this.coordinacionService.update(this.coordinacion)
      : this.coordinacionService.insert(this.coordinacion);

    accion$.subscribe(() => {
      alert(this.coordinacion.id ? '✅ Coordinación actualizada' : '✅ Coordinación registrada');
      this.limpiar();
      this.cargarTodo();
    });
  }

  editar(c: Coordinacion) {
    this.coordinacion = JSON.parse(JSON.stringify(c));
    this.intentado = false;
    this.errorCoordinacion = '';
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar esta coordinación?')) {
      this.coordinacionService.delete(id).subscribe(() => this.cargarTodo());
    }
  }

  buscar() {
    const term = this.searchCoordinacion.toLowerCase().trim();
    if (!term) {
      this.coordinacionesFiltradas = [...this.coordinaciones];
      return;
    }
    this.coordinacionesFiltradas = this.coordinaciones.filter(c =>
      c.emailEmpresa?.toLowerCase().includes(term) ||
      c.solicitud?.cliente?.nombre?.toLowerCase().includes(term) ||
      c.solicitud?.destino?.toLowerCase().includes(term) ||
      c.solicitud?.cliente?.rucDni?.toLowerCase().includes(term)
    );
    this.pagina = 1;
  }

  limpiar() {
    this.coordinacion = new Coordinacion();
    this.archivoSeleccionado = null;
    this.archivoBase64 = '';
    this.intentado = false;
    this.errorCoordinacion = '';
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.coordinacionesFiltradas.length / this.items));
  }

  cambiarPagina(d: number) {
    const nueva = this.pagina + d;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.pagina = nueva;
  }

  descargarArchivo(base64: string, nombre: string = 'archivo') {
    const link = document.createElement('a');
    link.href = base64;
    link.download = nombre;
    link.click();
  }

  esImagen(nombre: string): boolean {
    return /\.(png|jpg|jpeg)$/i.test(nombre || '');
  }
}
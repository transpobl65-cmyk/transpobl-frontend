import { Solicitud } from "./Solicitudes";

export class Coordinacion {
  id: number = 0;
  emailEmpresa: string = "";
  observaciones: string = "";
  solicitud: Solicitud = new Solicitud(); // relación con Solicitudes

    // 🆕 Campos para manejar archivo PDF
archivoNombre: string = '';
archivoBase64: string = '';

}

import { Asignacion } from "./Asignaciones";

export class GastosConductor {
  id: number = 0;

  // 🔹 Relaciones
  asignacion: Asignacion = new Asignacion();

  conductor: {
    id: number;
    username: string;
  } = { id: 0, username: '' };

  // 🔹 Datos principales
  fecha: Date = new Date();     // corresponde a LocalDate
  placa: string = '';
  ruta: string = '';
  tipo: string = '';
  proveedor: string = '';
  comprobante: string = '';
  monto: number = 0;            // BigDecimal → number
  observaciones: string = '';
}

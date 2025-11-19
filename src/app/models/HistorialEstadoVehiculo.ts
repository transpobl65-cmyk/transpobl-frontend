import { Vehiculo } from "./Vehiculos";

export class HistorialEstadoVehiculo {
  id: number = 0;
  vehiculo: Vehiculo = new Vehiculo(); // relación directa con Vehiculo
  estado: string = '';                 // En ruta, En mantenimiento, etc.
  fecha: Date = new Date();            // LocalDate → Date
  notas: string = '';                  // observaciones
}

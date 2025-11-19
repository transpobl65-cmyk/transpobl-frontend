import { Solicitud } from "./Solicitudes";
import { Vehiculo } from "./Vehiculos";


export class Asignacion {
  id: number = 0;

  // Fechas
  inicio: Date = new Date(); // corresponde a LocalDate → Date
  fin: Date = new Date();    // corresponde a LocalDate → Date

  // Estado general de la asignación
  estado: string = '';

  // Relaciones principales
  solicitud: Solicitud = new Solicitud(); // relación con Solicitudes
  vehiculo: Vehiculo = new Vehiculo();    // relación con Vehiculos

  // Relación con el conductor (usuario asignado al vehículo)
  conductor: {
    id: number;
    username: string;
  } = { id: 0, username: '' };
}

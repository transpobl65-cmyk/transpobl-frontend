import { Cliente } from "./CuotasMensualesConductor";
import { Vehiculo } from "./Vehiculos";

export class Solicitud {
 id: number = 0;
  fechaSalida: Date = new Date(); // LocalDate → Date
  destino: string = '';

  // 💰 Nuevo campo: precio del servicio
  precio: number = 0;

  // 🚛 Nuevo campo: relación con Vehículo
  vehiculo: Vehiculo = new Vehiculo();

  // relación con Cliente
  cliente: Cliente = new Cliente();

  // relación con Users → solo necesitamos el username
  usuario: {
    username: string;
  } = { username: '' };

  
}

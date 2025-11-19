export class Vehiculo {
  id: number = 0;
  placa: string = '';
  tipo: string = '';
  marca: string = '';
  modelo: string = '';
  anio: number = new Date().getFullYear();
  estadoActual: string = ''; // "Disponible", "En mantenimiento", etc.
}

export class GastosEmpresa {
  id: number = 0;
  fecha: Date = new Date();
  categoria: string = "";
  descripcion: string = "";
  monto: number = 0;

// Relación con el usuario que creó el gasto 
creadoPor: { username: string; // se envía solo el username desde Angular 
} = { username: "" }; }
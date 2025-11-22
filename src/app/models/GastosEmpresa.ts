export class GastosEmpresa {
  id?: number;  // <-- SIN VALOR POR DEFECTO
  fecha: Date = new Date();
  categoria: string = "";
  descripcion: string = "";
  monto: number = 0;

  creadoPor: {
    username: string;
  } = { username: "" };
}

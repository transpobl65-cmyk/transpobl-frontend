export class GastosEmpresa {
  id: number | null = null;
  fecha: Date = new Date();
  categoria: string = "";
  descripcion: string = "";
  monto: number = 0;

  creadoPor: {
    username: string;
  } = { username: "" };
}


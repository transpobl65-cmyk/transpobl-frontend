
export class GastosEmpresa {
  id?: number;   // ⭐ ID OPCIONAL, SIN NULL, SIN 0
  fecha: Date = new Date();
  categoria: string = "";
  descripcion: string = "";
  monto: number = 0;

  creadoPor: {
    username: string;
  } = { username: "" };
}

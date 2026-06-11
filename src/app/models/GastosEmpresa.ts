export class GastosEmpresa {
  id: number = 0 ;  
  fecha: Date | null = null;  // ← cambia esto

  categoria: string = "";
  descripcion: string = "";
  monto: number = 0;

  creadoPor: {
    username: string;
  } = { username: "" };
}


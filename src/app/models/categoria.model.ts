export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  idPadre: number | null;
  activa: boolean;
}

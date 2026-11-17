export type UnidadPresentacion = 'kg' | 'g' | 'pieza' | 'porción';
export type DisponibilidadProducto = 'disponible' | 'sobre_pedido' | 'agotado';

export interface CategoriaProducto { id: number; nombre: string; }
export interface FotoProducto { id: number; url: string; principal: boolean; orden: number; }
export interface PresentacionProducto {
  id: number;
  cantidad: number;
  unidad: UnidadPresentacion;
  precio: number;
  existencias: number;
  disponibilidad: DisponibilidadProducto;
}
export interface Producto {
  id: number;
  nombre: string;
  marca: string | null;
  categoria: CategoriaProducto;
  subcategoria: CategoriaProducto | null;
  sabor: string | null;
  descripcion: string | null;
  ingredientes: string | null;
  destacado: boolean;
  disponibilidad: DisponibilidadProducto;
  calificacionPromedio: number;
  cantidadOpiniones: number;
  presentaciones: PresentacionProducto[];
  fotos: FotoProducto[];
}
export interface PresentacionPublicacion {
  cantidad: number;
  unidad: UnidadPresentacion;
  precio: number;
  existencias: number;
}
export interface PublicacionProducto {
  nombre: string;
  marca?: string | null;
  categoriaId: number;
  subcategoriaId?: number | null;
  sabor?: string | null;
  descripcion?: string | null;
  ingredientes?: string | null;
  destacado?: boolean;
  presentaciones: PresentacionPublicacion[];
}
export interface SaborPorCategoria { categoriaId: number; categoriaNombre: string; sabores: string[]; }

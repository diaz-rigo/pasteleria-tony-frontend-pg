export interface Usuario {
  intUsuLlave?: number;
  strUsuEmail: string;
  strUsuPassword?: string;
  strUsuRol: string;
  strUsuNombre: string;
  strUsuApellidoMaterno?: string;
  strUsuApellidoPaterno?: string;
  strUsuTelefono?: string;
  strUsuEstado: string;
  strUsuDireccion?: string;
  strUsuCiudad?: string;
  strUsuCodigoPostal?: string;
  strUsuPais?: string;
  dtUsuCreado?: string;
  dtUsuActualizado?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  mensaje?: string;
  error?: string;
}

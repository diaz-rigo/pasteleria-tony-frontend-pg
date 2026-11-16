export interface Categoria {
  intCtgLlave?: number;
  strCtgNombre: string;
  strCtgDescripcion?: string;
  blnCtgActivo?: boolean;
}

export interface Producto {
  intProLlave?: number;
  strProNombre: string;
  strProMarca?: string;
  intCtgLlave: number;
  strProIngredientes: string;
  strProDescripcion?: string;
  blnProDestacado?: boolean;
  strProEstadoDisponibilidad?: string;
  decProCalificacionPromedio?: number;
}

export interface VarianteProducto {
  intVarLlave?: number;
  intProLlave: number;
  strVarSabor: string;
  strVarColor: string;
  strVarTextura: string;
  strVarForma: string;
  strVarDescripcion?: string;
  strVarEstadoDisponibilidad?: string;
}

export interface ImagenVariante {
  intImaLlave?: number;
  intVarLlave: number;
  strImaUrl: string;
}

export interface Talla {
  intTalLlave?: number;
  intVarLlave: number;
  decTalMedida: number;
  intTalStock?: number;
  decTalPrecio: number;
  strTalEstadoDisponibilidad?: string;
}

export interface ImagenGaleria {
  intImgLlave?: number;
  intGalLlave: number;
  strImgUrl: string;
  strImgLeyenda?: string;
  strImgCategoria?: string;
}

export interface TelefonoConfiguracion { intTelLlave?: number; intCfgLlave: number; strTelTipo?: string; strTelNumero?: string; blnTelPrincipal?: boolean; }
export interface EmailConfiguracion { intEmaLlave?: number; intCfgLlave: number; strEmaDireccion: string; blnEmaPrincipal?: boolean; }
export interface HorarioConfiguracion { intHorLlave?: number; intCfgLlave: number; strHorDias?: string; strHorHoras?: string; blnHorAbierto?: boolean; }
export interface RedSocialConfiguracion { intRedLlave?: number; intCfgLlave: number; strRedPlataforma: string; strRedUrl: string; blnRedActiva?: boolean; }
export interface EnlacePie { intEnlLlave?: number; intCfgLlave: number; strEnlTexto: string; strEnlUrl: string; }
export interface EtiquetaPortafolio { intEtiLlave?: number; intPorLlave: number; strEtiNombre: string; }
export interface ColorPortafolio { intColLlave?: number; intPorLlave: number; strColNombre: string; }
export interface CategoriaGaleria { intGctLlave?: number; intGalLlave: number; strGctNombre: string; }
export interface EtiquetaGaleria { intEtiLlave?: number; intGalLlave: number; strEtiNombre: string; }
export interface Calificacion { intCalLlave?: number; intProLlave: number; shtCalPuntuacion: number; }

export interface Pedido {
  intPedLlave?: number;
  strPedCodigo?: string;
  strPedNombreCliente: string;
  strPedTelefonoCliente: string;
  strPedEmailCliente: string;
  strPedMetodoEntrega: 'RECOGER' | 'DOMICILIO';
  dtPedFechaEntrega: string;
  strPedHoraEntrega?: string;
  strPedModo: 'APARTAR' | 'PEDIR';
  strPedEstado?: string;
  decPedTotal?: number;
}

export interface Galeria {
  intGalLlave?: number;
  strGalTitulo: string;
  strGalDescripcion?: string;
  blnGalActivo?: boolean;
  blnGalDestacado?: boolean;
  intProLlave?: number;
  strGalSaborRelacionado?: string;
}

export interface Portafolio {
  intPorLlave?: number;
  strPorUrlImagen: string;
  strPorTitulo?: string;
  strPorDescripcion?: string;
  strPorTipoEvento?: string;
  strPorTipoProducto?: string;
  blnPorDestacado?: boolean;
}

export interface Configuracion {
  intCfgLlave?: number;
  strCfgColorFondoEncabezado?: string;
  strCfgColorPrimario?: string;
  strCfgTextoPie?: string;
  strCfgTituloHero?: string;
  strCfgSubtituloHero?: string;
  strCfgNombreNegocio?: string;
  strCfgCalle?: string;
  strCfgCiudad?: string;
  strCfgEstado?: string;
  strCfgCodigoPostal?: string;
  strCfgPais?: string;
  strCfgTituloMeta?: string;
  strCfgDescripcionMeta?: string;
}

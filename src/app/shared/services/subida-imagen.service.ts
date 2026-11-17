import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';

type SeccionImagen = 'galerias' | 'portafolio' | 'configuracion';
interface FirmaImagen { nombreNube: string; claveApi: string; marcaTemporal: number; carpeta: string; firma: string; }
interface ResultadoCloudinary { secure_url: string; }

@Injectable({ providedIn: 'root' })
export class SubidaImagenService {
  private readonly http = inject(HttpClient);

  async subir(archivo: File, seccion: SeccionImagen): Promise<string> {
    this.validar(archivo);
    const firmaRespuesta = await firstValueFrom(this.http.post<ApiResponse<FirmaImagen>>(`${environment.apiUrl}/cloudinary/upload-signature`, { seccion }));
    if (!firmaRespuesta.ok || !firmaRespuesta.data) throw new Error(firmaRespuesta.mensaje || 'No se pudo preparar la carga de imagen.');
    const firma = firmaRespuesta.data;
    const formulario = new FormData();
    formulario.append('file', archivo);
    formulario.append('api_key', firma.claveApi);
    formulario.append('timestamp', String(firma.marcaTemporal));
    formulario.append('folder', firma.carpeta);
    formulario.append('signature', firma.firma);
    const respuesta = await firstValueFrom(this.http.post<ResultadoCloudinary>(`https://api.cloudinary.com/v1_1/${firma.nombreNube}/image/upload`, formulario, { withCredentials: false }));
    if (!respuesta.secure_url) throw new Error('Cloudinary no devolvió la dirección segura de la imagen.');
    return respuesta.secure_url;
  }

  private validar(archivo: File): void {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) throw new Error('Selecciona una imagen JPG, PNG o WEBP.');
    if (archivo.size > 10 * 1024 * 1024) throw new Error('La imagen debe pesar máximo 10 MB.');
  }
}

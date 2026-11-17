const MAX_UPLOAD_DIMENSION = 1920;
const MIN_IMAGE_SIZE_TO_COMPRESS = 300 * 1024;

/** Resize and encode large uploads before they leave the device. */
export async function optimizarImagenSubida(archivo: File): Promise<File> {
  if (typeof createImageBitmap === 'undefined') return archivo;

  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(archivo); }
  catch { return archivo; }

  try {
    const escala = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (escala === 1 && archivo.size <= MIN_IMAGE_SIZE_TO_COMPRESS) return archivo;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * escala));
    canvas.height = Math.max(1, Math.round(bitmap.height * escala));
    const contexto = canvas.getContext('2d');
    if (!contexto) return archivo;
    contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', .82));
    if (!blob || blob.type !== 'image/webp' || blob.size >= archivo.size) return archivo;
    const nombre = `${archivo.name.replace(/\.[^.]+$/, '')}.webp`;
    return new File([blob], nombre, { type: 'image/webp', lastModified: archivo.lastModified });
  } finally { bitmap.close(); }
}

/** Ask Cloudinary for a correctly sized modern format; leave external URLs as is. */
export function urlImagenOptimizada(url: string | null | undefined, ancho: number): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') return url;
    const ruta = '/image/upload/';
    const posicion = parsed.pathname.indexOf(ruta);
    if (posicion < 0) return url;
    const antes = parsed.pathname.slice(0, posicion + ruta.length);
    const despues = parsed.pathname.slice(posicion + ruta.length);
    if (/^(?:f_auto|q_auto|w_\d+,)/.test(despues)) return url;
    parsed.pathname = `${antes}f_auto,q_auto,w_${ancho},c_limit/${despues}`;
    return parsed.toString();
  } catch { return url; }
}

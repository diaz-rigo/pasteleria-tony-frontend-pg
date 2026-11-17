import { Pipe, PipeTransform } from '@angular/core';
import { urlImagenOptimizada } from '../utils/cloudinary-image.util';

@Pipe({ name: 'cloudinaryImage', standalone: true, pure: true })
export class CloudinaryImagePipe implements PipeTransform {
  transform(url: string | null | undefined, ancho = 800): string | null {
    return urlImagenOptimizada(url, ancho);
  }
}

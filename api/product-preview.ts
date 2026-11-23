const API_URL = 'https://pasteleria-tony-api.vercel.app/api';
const SITE_URL = 'https://pasteleria-tony.vercel.app';

type ProductResponse = {
  ok?: boolean;
  data?: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    categoria?: { nombre?: string };
    fotos?: Array<{ url: string; principal?: boolean; orden?: number }>;
  };
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const id = new URL(request.url).searchParams.get('id') || '';
    if (!/^\d+$/.test(id)) {
      return new Response('Identificador de producto no válido.', { status: 400 });
    }

    try {
      const response = await fetch(`${API_URL}/productos/${id}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        return new Response('No se pudo cargar el producto.', { status: response.status === 404 ? 404 : 502 });
      }

      const result = await response.json() as ProductResponse;
      const product = result.data;
      if (!result.ok || !product) {
        return new Response('No encontramos este producto.', { status: 404 });
      }

      const photo = product.fotos?.find(item => item.principal)?.url || product.fotos?.[0]?.url;
      const image = photo && /^https:\/\//i.test(photo) ? photo : `${SITE_URL}/favicon-192.png`;
      const title = `${product.nombre} | Pastelería Tony`;
      const description = product.descripcion?.trim()
        || `Conoce ${product.nombre}${product.categoria?.nombre ? `, de ${product.categoria.nombre},` : ''} en Pastelería Tony. Consulta presentaciones, precio y disponibilidad por WhatsApp.`;
      const url = `${SITE_URL}/producto/${id}`;
      const html = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="product"><meta property="og:site_name" content="Pastelería Tony"><meta property="og:locale" content="es_MX"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:secure_url" content="${escapeHtml(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image)}"><meta http-equiv="refresh" content="0;url=${url}"></head><body><p>Abriendo ${escapeHtml(product.nombre)}… <a href="${url}">Ver producto</a></p></body></html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      });
    } catch (error) {
      console.error('Error al generar la vista previa del producto:', error);
      return new Response('No se pudo cargar la vista previa del producto.', { status: 502 });
    }
  },
};

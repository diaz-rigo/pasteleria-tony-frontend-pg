import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist', 'pasteleria-tony-frontend-pg', 'browser');
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://pasteleria-tony.vercel.app';
const productsApi = process.env.PRODUCTS_API_URL || 'https://pasteleria-tony-api.vercel.app/api/productos';
const marker = '<!-- PRODUCT_OPEN_GRAPH -->';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function shorten(value, maxLength = 200) {
  const text = String(value || '').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

const indexPath = path.join(outputDirectory, 'index.html');
const baseHtml = await readFile(indexPath, 'utf8');
if (!baseHtml.includes(marker)) {
  throw new Error(`No se encontró el marcador ${marker} en src/index.html.`);
}

const response = await fetch(productsApi, { headers: { Accept: 'application/json' } });
if (!response.ok) {
  throw new Error(`La API pública de productos respondió ${response.status}.`);
}

const result = await response.json();
if (result?.ok !== true || !Array.isArray(result.data)) {
  throw new Error('La respuesta de la API no contiene la lista pública de productos esperada.');
}

let generated = 0;
for (const product of result.data) {
  const id = Number(product?.id);
  if (!Number.isSafeInteger(id) || id < 1 || !product?.nombre) continue;

  const photo = product.fotos?.find(item => item.principal)?.url || product.fotos?.[0]?.url;
  let image = `${siteUrl}/favicon-192.png`;
  if (photo) {
    try {
      const parsedImage = new URL(photo);
      if (parsedImage.protocol === 'https:') image = parsedImage.href;
    } catch {
      // Mantiene la imagen de marca como alternativa si la foto no tiene una URL pública válida.
    }
  }

  const url = `${siteUrl}/producto/${id}`;
  const title = `${product.nombre} | Pastelería Tony`;
  const description = shorten(product.descripcion)
    || `Conoce ${product.nombre}${product.categoria?.nombre ? `, de ${product.categoria.nombre},` : ''} en Pastelería Tony. Consulta presentaciones, precio y disponibilidad.`;
  const metadata = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    '<meta property="og:type" content="product">',
    '<meta property="og:site_name" content="Pastelería Tony">',
    '<meta property="og:locale" content="es_MX">',
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}">`,
    `<meta property="og:image:alt" content="${escapeHtml(product.nombre)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(image)}">`,
  ].join('\n  ');
  const html = baseHtml.replace(marker, metadata);
  const pagePath = path.join(outputDirectory, 'producto', `${id}.html`);
  await mkdir(path.dirname(pagePath), { recursive: true });
  await writeFile(pagePath, html, 'utf8');
  generated++;
}

console.log(`Metadatos Open Graph generados para ${generated} productos.`);

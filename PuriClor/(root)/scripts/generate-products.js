/**
 * Scans /assets for images whose filename starts with uppercase "P",
 * then writes productos-data.json for the products grid.
 * Run from project root: node PuriClor/\(root\)/scripts/generate-products.js
 * Or from (root): node scripts/generate-products.js
 */
const fs = require('fs');
const path = require('path');

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets');
const OUTPUT_PATH = path.join(__dirname, '..', 'productos-data.json');

function startsWithUppercaseP(name) {
  return name.length > 0 && name[0] === 'P';
}

function hasImageExtension(name) {
  const ext = path.extname(name).toLowerCase();
  return IMAGE_EXT.includes(ext);
}

/** "carro3" -> "Carro 3", "soda-caustica-300x300" -> "Soda Caustica 300x300" */
function toTitle(baseName) {
  const withTrailingNum = baseName.replace(/(\D)(\d+)$/, '$1 $2');
  const withSpaces = withTrailingNum.replace(/[-_]+/g, ' ');
  return withSpaces
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/** "carro3" -> "carro-3", "soda-caustica-300x300" -> "soda-caustica-300x300" */
function toSlug(baseName) {
  return baseName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getProducts() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.warn('Assets directory not found:', ASSETS_DIR);
    return [];
  }
  const files = fs.readdirSync(ASSETS_DIR);
  const products = files
    .filter((f) => startsWithUppercaseP(f) && hasImageExtension(f))
    .map((filename) => {
      const baseWithP = path.basename(filename, path.extname(filename));
      const baseName = baseWithP.slice(1); // remove leading P
      const title = toTitle(baseName);
      const slug = toSlug(baseName);
      return {
        filename,
        title,
        slug,
        description: 'Producto para tratamiento profesional de agua y piscinas.',
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'es'));
  return products;
}

const products = getProducts();
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log('Generated', products.length, 'products ->', OUTPUT_PATH);

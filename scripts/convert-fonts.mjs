/**
 * Convert TTF fonts to WOFF2 format using the wawoff2 package.
 * Usage: node scripts/convert-fonts.mjs
 */
import { compress } from 'wawoff2';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const FONTS_DIR = 'public/fonts';
const KEEP_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'];

const files = readdirSync(FONTS_DIR).filter(f => f.endsWith('.ttf'));

for (const file of files) {
  const shouldKeep = KEEP_WEIGHTS.some(w => file.includes(w) && !file.includes('Italic'));
  if (!shouldKeep) {
    console.log(`⏭️  Skipping: ${file}`);
    continue;
  }

  const inputPath = join(FONTS_DIR, file);
  const outputPath = join(FONTS_DIR, file.replace('.ttf', '.woff2'));
  
  const inputBuffer = readFileSync(inputPath);
  const outputBuffer = await compress(inputBuffer);
  writeFileSync(outputPath, outputBuffer);
  
  const savedPct = ((1 - outputBuffer.length / inputBuffer.length) * 100).toFixed(1);
  console.log(`✅ ${file} (${(inputBuffer.length/1024).toFixed(1)}KB) → ${basename(outputPath)} (${(outputBuffer.length/1024).toFixed(1)}KB) — ${savedPct}% saved`);
}

console.log('\n🎉 Done! WOFF2 fonts generated.');

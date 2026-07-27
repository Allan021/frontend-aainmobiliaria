// Chequeo de la verificación del geocoder: es la lógica que evita poner un pin
// en el municipio equivocado. Corre con `pnpm check` — sin framework.
import assert from 'node:assert/strict';
import { normalizar, coincideConLoEsperado, esPrecisa } from './ui/components/shared/map/geocode.ts';

const ctx = (place?: string, region?: string) => ({
  ...(place ? { place: { name: place } } : {}),
  ...(region ? { region: { name: region } } : {}),
});

const tests: [string, () => void][] = [];
const test = (nombre: string, fn: () => void) => tests.push([nombre, fn]);

test('normalizar ignora tildes, mayúsculas y "Departamento de"', () => {
  assert.equal(normalizar('Departamento de Yoro'), normalizar('yoro'));
  assert.equal(normalizar('Atlántida'), normalizar('ATLANTIDA'));
  assert.equal(normalizar('El Progreso'), normalizar('progreso'));
});

test('acepta cuando el municipio coincide', () => {
  assert.equal(coincideConLoEsperado(ctx('El Progreso', 'Departamento de Yoro'), 'El Progreso', 'Yoro'), true);
});

test('acepta cuando solo coincide el departamento', () => {
  assert.equal(coincideConLoEsperado(ctx('Morazán', 'Departamento de Yoro'), 'El Progreso', 'Yoro'), true);
});

test('RECHAZA el caso real que puso el pin a 150 km', () => {
  // "Boulevard Morazán, Tegucigalpa" devolvía el pueblo de Morazán, Yoro
  assert.equal(
    coincideConLoEsperado(ctx('Morazán', 'Departamento de Yoro'), 'Tegucigalpa', 'Francisco Morazán'),
    false,
  );
});

test('sin nada contra qué contrastar, no bloquea', () => {
  assert.equal(coincideConLoEsperado(ctx('Tela', 'Departamento de Atlántida'), null, null), true);
});

test('esPrecisa distingue calle de centro del pueblo', () => {
  assert.equal(esPrecisa('address'), true);
  assert.equal(esPrecisa('street'), true);
  assert.equal(esPrecisa('neighborhood'), true);
  assert.equal(esPrecisa('place'), false);   // solo el centro del municipio
  assert.equal(esPrecisa('region'), false);
});

let fallidos = 0;
for (const [nombre, fn] of tests) {
  try {
    fn();
    console.log(`  ok  ${nombre}`);
  } catch (err) {
    fallidos++;
    console.error(`FAIL  ${nombre}\n      ${(err as Error).message}`);
  }
}
console.log(`\n${tests.length - fallidos}/${tests.length} pasaron`);
process.exit(fallidos ? 1 : 0);

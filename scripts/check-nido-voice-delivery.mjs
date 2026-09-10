import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("public/assets/nido/audio");
const output = resolve("dist/assets/nido/audio");
for (const name of ["manifest.json", "cuentos-manifest.json"]) {
  assert.deepEqual(
    JSON.parse(await readFile(resolve(output, name), "utf8")),
    JSON.parse(await readFile(resolve(source, name), "utf8")),
    `La compactación debe conservar todo el contenido de ${name}`,
  );
}
const names = await readdir(resolve(source, "cuentos"));
const published = await readdir(resolve(output, "cuentos"));
const audioNames = names.filter(name => name.endsWith(".mp3")).sort();
assert.deepEqual(published.filter(name => name.endsWith(".mp3")).sort(), audioNames);
assert.ok(names.some(name => name.endsWith(".json")), "Conservar la caché del generador en las fuentes");
assert.ok(!published.some(name => name.endsWith(".json")), "No publicar la caché duplicada de alineación");
for (const name of audioNames) {
  assert.equal(
    (await stat(resolve(output, "cuentos", name))).size,
    (await stat(resolve(source, "cuentos", name))).size,
    `Audio íntegro: ${name}`,
  );
}
console.log(`✓ Dos manifiestos íntegros y ${audioNames.length} locuciones conservadas en la distribución.`);

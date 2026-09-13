import test from 'node:test';
import assert from 'node:assert/strict';
import { TextureCache } from '../../src/nido/cuentos/three/texture-cache.js';

test('las texturas conservan las páginas recientes y liberan las anteriores', async () => {
  const disposed = [];
  const texture = id => ({ dispose: () => disposed.push(id) });
  const cache = new TextureCache(2);
  cache.set('a', texture('a')).set('b', texture('b'));
  cache.get('a');
  cache.set('c', texture('c'));
  await Promise.resolve();
  assert.deepEqual([...cache.keys()], ['a', 'c']);
  assert.deepEqual(disposed, ['b']);
  cache.clear();
  await Promise.resolve();
  assert.equal(cache.size, 0);
  assert.deepEqual(disposed, ['b', 'a', 'c']);
});

test('una textura expulsada mientras carga se libera al llegar, sin rechazos sueltos', async () => {
  let resolve;
  let disposed = false;
  const cache = new TextureCache(1);
  cache.set('late', new Promise(done => { resolve = done; }));
  cache.set('bad', Promise.reject(new Error('imagen no disponible')));
  cache.set('ready', { dispose() {} });
  resolve({ dispose() { disposed = true; } });
  await new Promise(done => setTimeout(done, 0));
  assert.equal(disposed, true);
  assert.equal(cache.size, 1);
});

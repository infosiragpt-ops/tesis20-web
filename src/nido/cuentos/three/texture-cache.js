// Conserva sólo los recursos recientes, incluidos los que todavía se cargan.
// Así recorrer cientos de páginas no retiene cientos de lienzos y texturas.
export class TextureCache extends Map {
  constructor(limit) { super(); this.limit = limit; }
  get(key) {
    const value = super.get(key);
    if (super.has(key)) { super.delete(key); super.set(key, value); }
    return value;
  }
  set(key, value) {
    if (super.has(key) && super.get(key) !== value) this.delete(key);
    super.delete(key);
    super.set(key, value);
    while (this.size > this.limit) this.delete(this.keys().next().value);
    return this;
  }
  delete(key) {
    if (!super.has(key)) return false;
    const value = super.get(key);
    super.delete(key);
    Promise.resolve(value).then(texture => texture?.dispose?.()).catch(() => {});
    return true;
  }
  clear() { for (const key of this.keys()) this.delete(key); }
}

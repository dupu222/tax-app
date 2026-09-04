export function createMemoryBucket(initial = {}) {
  const map = new Map(
    Object.entries(initial).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]),
  );

  return {
    async get(key) {
      if (!map.has(key)) {
        return null;
      }
      const text = map.get(key);
      return {
        async text() {
          return text;
        },
        async json() {
          return JSON.parse(text);
        },
      };
    },
    async put(key, value) {
      map.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    async delete(key) {
      map.delete(key);
    },
  };
}

export function resolveBucket(env) {
  return env?.TAX_DATA || null;
}

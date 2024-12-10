import Fuse from 'fuse.js';

export function createFuzzySearch<T>(items: T[], keys: string[]) {
  const options = {
    keys,
    threshold: 0.3,
    distance: 100
  };

  return new Fuse(items, options);
}
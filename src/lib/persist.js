function persist(cache, persisted, now = Date()) {
  const newPredictions = cache.filter((cp) => !persisted.some((pp) => pp.class === cp.class));
  const removedPredictions = persisted.filter((cp) => !cache.some((pp) => pp.class === cp.class));

  return [...persisted, ...newPredictions].reduce((acc, curr) => [
    ...acc,
    removedPredictions.some((rp) => rp.class === curr.class)
      ? { ...curr, out: now }
      : curr,
  ], []);
}

export default persist;

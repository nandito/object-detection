const TIME_FRAME = 60; // 1 min

const diffSecs = (date1, date2) => (date1 - date2) / 1000;

function persist(cache, persisted, now = new Date()) {
  const newPredictions = cache.filter((cp) => !persisted.some((pp) => pp.class === cp.class)
    || persisted.some((pp) => pp.class === cp.class && diffSecs(new Date(), pp?.out) > TIME_FRAME));
  const removedPredictions = persisted.filter((cp) => !cache.some((pp) => pp.class === cp.class));

  return [...persisted, ...newPredictions].reduce((acc, curr) => [
    ...acc,
    removedPredictions.some((rp) => rp.class === curr.class)
      ? { ...curr, out: now }
      : curr,
  ], []);
}

export default persist;

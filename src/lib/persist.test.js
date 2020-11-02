import test from 'ava';
import persist from './persist';

const person = { class: 'person' };
const dog = { class: 'dog' };
const now = Date();

const cases = [
  {
    name: 'empty cache, empty persisted',
    cache: [],
    persisted: [],
    output: [],
    date: now,
  },
  {
    name: 'has cached, empty persisted',
    cache: [person, dog],
    persisted: [],
    output: [person, dog],
    date: now,
  },
  {
    name: 'has 2 cached, has 1 persisted',
    cache: [person, dog],
    persisted: [dog],
    output: [dog, person],
    date: now,
  },
  {
    name: 'has 1 cached, has 2 persisted',
    cache: [dog],
    persisted: [person, dog],
    output: [{ ...person, out: now }, dog],
    date: now,
  },
];

function macro(t, cache, persisted, date, expected) {
  t.deepEqual(persist(cache, persisted, date), expected);
}

// eslint-disable-next-line no-restricted-syntax
for (const {
  name, cache, persisted, output, date = now,
} of cases) {
  test(name, macro, cache, persisted, date, output);
}

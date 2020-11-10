import test from 'ava';
import persist from './persist';

const person = { class: 'person', in: new Date() };
const dog = { class: 'dog', in: new Date() };
const now = new Date();
const someSecAgo = ((d) => new Date(d.setSeconds(d.getSeconds() - 58)))(new Date());
const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());

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
  {
    name: 'has 1 cached, has 1 persisted - same class, different time',
    cache: [{ ...person }],
    persisted: [{ ...person, out: yesterday }],
    output: [{ ...person, out: yesterday }, { ...person }],
    date: now,
  },
  {
    name: 'has 2 cached, has 2 persisted - same class, different time',
    cache: [{ ...person }, { ...dog }],
    persisted: [{ ...person, out: yesterday }, { ...dog, out: yesterday }],
    output: [
      { ...person, out: yesterday },
      { ...dog, out: yesterday },
      { ...person },
      { ...dog },
    ],
    date: now,
  },
  {
    name: 'has 2 cached, has 2 persisted - same class, different time - in timeframe',
    cache: [{ ...person }, { ...dog }],
    persisted: [{ ...person, out: someSecAgo }, { ...dog, out: someSecAgo }],
    output: [
      { ...person, out: someSecAgo },
      { ...dog, out: someSecAgo },
    ],
    date: now,
  },
  {
    name: 'empty cache, has 2 persisted',
    cache: [],
    persisted: [{ ...person, out: yesterday }, { ...dog, out: someSecAgo }],
    output: [
      { ...person, out: yesterday },
      { ...dog, out: someSecAgo },
    ],
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

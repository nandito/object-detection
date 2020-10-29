import test from 'ava';
import persist from './persist';

function macro(t, cache, persisted, date, expected) {
  t.deepEqual(persist(cache, persisted, date), expected);
}

const person = { class: 'person' };
const dog = { class: 'dog' };
const now = Date();

test('empty cache, empty persisted', macro, [], [], now, []);
test('has cached, empty persisted', macro, [person, dog], [], now, [person, dog]);
test('has 2 cached, has 1 persisted', macro, [person, dog], [dog], now, [dog, person]);
test('has 1 cached, has 2 persisted', macro, [dog], [person, dog], now, [{ ...person, out: now }, dog]);

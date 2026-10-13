'use strict';
const assert = require('assert');
const { normalizePhone, processOrders } = require('./sync');

assert.strictEqual(normalizePhone('+7 999 123-45-67'), '+79991234567');
assert.strictEqual(normalizePhone('8 (999) 123 45 67'), '+79991234567');
assert.strictEqual(normalizePhone('9005551212'), '+79005551212');
assert.strictEqual(normalizePhone('+7 999'), null);
assert.strictEqual(normalizePhone('не указан'), null);
assert.strictEqual(normalizePhone(''), null);
assert.strictEqual(normalizePhone('12345678901'), null);

const r = processOrders([
  { name: 'A', phone: '89991234567', email: '', amount: 100, created_at: '2026-10-01T00:00:00Z' },
  { name: 'B', phone: '+79991234567', email: '', amount: 100, created_at: '2026-10-02T00:00:00Z' },
  { name: 'C', phone: '9991234567', email: '', amount: 50, created_at: '2026-10-03T00:00:00Z' },
  { name: 'D', phone: 'x', email: '', amount: 1, created_at: '2026-10-03T00:00:00Z' },
]);
assert.deepStrictEqual(r.clients, [{ name: 'B', phone: '+79991234567', email: '', amount: 100 }]);
assert.deepStrictEqual(r.stats, { received: 4, unique: 1, duplicates_merged: 2, invalid_dropped: 1 });
console.log('ok');

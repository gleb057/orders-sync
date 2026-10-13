'use strict';

const SOURCE_URL = process.env.SOURCE_URL || 'https://test.ooobs.ru/api/orders';

// Приводит телефон к +7XXXXXXXXXX или возвращает null, если номер невалиден.
// Принимаем: 11 цифр с ведущей 7 или 8; 10 цифр (номер без кода страны).
function normalizePhone(raw) {
  if (raw === null || raw === undefined) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) digits = '7' + digits;
  if (digits.length !== 11) return null;
  if (digits[0] === '8') digits = '7' + digits.slice(1);
  if (digits[0] !== '7') return null;
  return '+' + digits;
}

function toAmount(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toTime(v) {
  const t = Date.parse(v);
  return Number.isNaN(t) ? -Infinity : t;
}

// true, если кандидат должен заменить текущую запись:
// больший amount, при равенстве — более поздний created_at.
function isBetter(candidate, current) {
  if (candidate.amount !== current.amount) return candidate.amount > current.amount;
  return toTime(candidate.created_at) > toTime(current.created_at);
}

function processOrders(orders) {
  if (!Array.isArray(orders)) throw new Error('Source did not return a JSON array');

  const byPhone = new Map();
  let invalid = 0;
  let valid = 0;

  for (const o of orders) {
    const phone = normalizePhone(o && o.phone);
    if (!phone) { invalid++; continue; }
    valid++;
    const rec = {
      name: o.name == null ? '' : String(o.name).trim(),
      phone,
      email: o.email == null ? '' : String(o.email).trim(),
      amount: toAmount(o.amount),
      created_at: o.created_at,
    };
    const cur = byPhone.get(phone);
    if (!cur || isBetter(rec, cur)) byPhone.set(phone, rec);
  }

  // Детерминированный порядок — одинаковый ответ при каждом запуске.
  const clients = [...byPhone.values()]
    .sort((a, b) => a.phone.localeCompare(b.phone))
    .map(({ name, phone, email, amount }) => ({ name, phone, email, amount }));

  return {
    clients,
    stats: {
      received: orders.length,
      unique: clients.length,
      duplicates_merged: valid - clients.length,
      invalid_dropped: invalid,
    },
  };
}

async function fetchOrders() {
  const res = await fetch(SOURCE_URL, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Source responded ${res.status}`);
  return res.json();
}

async function sync() {
  return processOrders(await fetchOrders());
}

module.exports = { normalizePhone, processOrders, fetchOrders, sync };

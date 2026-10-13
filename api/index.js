'use strict';
const { sync } = require('../sync');

// Каждый запрос заново забирает заявки и пересчитывает результат.
// Результат — чистая функция от входных данных (дедуп по ключу-телефону,
// стабильная сортировка), поэтому повторная синхронизация идемпотентна.
module.exports = async (req, res) => {
  try {
    const result = await sync();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;
    res.end(JSON.stringify(result, null, 2));
  } catch (e) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 502;
    res.end(JSON.stringify({ error: e.message }));
  }
};

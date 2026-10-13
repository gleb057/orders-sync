'use strict';
// Локальный запуск / Render / Railway / свой сервер: node server.js
const http = require('http');
const handler = require('./api');

const port = process.env.PORT || 3000;
http.createServer(handler).listen(port, () => console.log(`Listening on :${port}`));

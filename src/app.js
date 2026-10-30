require('dotenv').config();
const express = require('express');
const requestId = require('./middlewares/request-id');
const cookies = require('./middlewares/cookies');
const errorHandler = require('./middlewares/error-handler');
const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/companies.routes');

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});
app.use(requestId);
app.use(express.json({ limit: '32kb' }));
app.use(cookies);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/companies/:companyId', companyRoutes);
app.use((req, res) => res.status(404).json({ code: 'NOT_FOUND', message: 'No se encontró la ruta.', requestId: req.requestId }));
app.use(errorHandler);
module.exports = app;
